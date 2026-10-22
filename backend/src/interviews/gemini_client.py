"""Wraps all Gemini calls behind two functions.

Exactly two Gemini calls per completed interview (question generation, then
one batched grading call for the whole session) — keeps comfortably inside
the free-tier RPM/RPD limits and gives the model full context to produce
coherent overall feedback, rather than N isolated per-answer calls.
"""

import logging
import time

from google import genai
from google.genai import types
from django.conf import settings

from .schemas import QuestionList, SessionFeedback

logger = logging.getLogger(__name__)

_client = None

# Rate limits (429) and "high demand" overloads (500/503/504) are per-model and
# usually brief, so they're worth retrying or moving to a fallback model.
_TRANSIENT_STATUSES = {429, 500, 503, 504}
_TRANSIENT_MARKERS = ("RESOURCE_EXHAUSTED", "UNAVAILABLE", "DEADLINE_EXCEEDED")
_RETRY_DELAY_SECONDS = 1.0
# Lambda times out at 30s; never start another attempt past this point.
_ATTEMPT_DEADLINE_SECONDS = 20.0


class GeminiClientError(Exception):
    pass


class GeminiRateLimitError(GeminiClientError):
    pass


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def _is_transient(exc: Exception) -> bool:
    status = getattr(exc, "code", None) or getattr(exc, "status_code", None)
    message = str(exc)
    return status in _TRANSIENT_STATUSES or any(m in message for m in _TRANSIENT_MARKERS)


def _generate(prompt: str, schema):
    """Try the primary model (twice), then each fallback, on transient errors only."""
    primary = settings.GEMINI_MODEL
    attempts = [(primary, 0.0), (primary, _RETRY_DELAY_SECONDS)]
    attempts += [(m, 0.0) for m in settings.GEMINI_FALLBACK_MODELS if m != primary]

    started = time.monotonic()
    last_exc = None
    for model, delay in attempts:
        if time.monotonic() - started + delay > _ATTEMPT_DEADLINE_SECONDS:
            break
        time.sleep(delay)
        try:
            return _get_client().models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema,
                ),
            )
        except Exception as exc:
            if not _is_transient(exc):
                raise GeminiClientError(f"Gemini API call failed: {exc}") from exc
            logger.warning("Gemini model %s unavailable, trying next: %s", model, exc)
            last_exc = exc

    raise GeminiRateLimitError(
        "Gemini is busy right now. Please try again in a moment."
    ) from last_exc


def generate_questions(role_title: str, count: int) -> list[str]:
    prompt = (
        f"You are an expert technical interviewer. Generate exactly {count} realistic, "
        f"distinct interview questions for a candidate interviewing for the role of "
        f"'{role_title}'. Mix behavioral and role-specific technical/situational questions. "
        f"Each question must be self-contained and answerable in a few sentences."
    )
    response = _generate(prompt, QuestionList)
    data = QuestionList.model_validate_json(response.text)
    questions = data.questions[:count]
    if len(questions) < count:
        raise GeminiClientError("Gemini returned fewer questions than requested.")
    return questions


def grade_session(role_title: str, questions: list[str], answers: list[str]) -> SessionFeedback:
    qa_block = "\n\n".join(
        f"Q{i + 1}: {q}\nCandidate's answer: {a or '(no answer provided)'}"
        for i, (q, a) in enumerate(zip(questions, answers))
    )
    prompt = (
        f"You are an expert interview coach grading a mock interview for the role of "
        f"'{role_title}'. For each question below, score the candidate's answer from 0 to 10 "
        f"and give concrete, specific strengths and improvements. Then give an overall score "
        f"(0 to 10) and a short overall summary of the candidate's performance.\n\n{qa_block}"
    )
    response = _generate(prompt, SessionFeedback)
    return SessionFeedback.model_validate_json(response.text)
