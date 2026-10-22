"""Structured-output schemas for Gemini (google-genai's response_schema)."""

from pydantic import BaseModel, Field


class QuestionList(BaseModel):
    questions: list[str] = Field(description="Interview questions, one per list item.")


class QuestionFeedback(BaseModel):
    questionIndex: int = Field(description="1-based index matching the question order.")
    score: int = Field(description="Score from 0 to 10.")
    strengths: list[str]
    improvements: list[str]


class SessionFeedback(BaseModel):
    overallScore: int = Field(description="Overall score from 0 to 10.")
    overallSummary: str
    perQuestion: list[QuestionFeedback]
