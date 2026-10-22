import pytest

from interviews import gemini_client
from interviews.schemas import QuestionList


class FakeAPIError(Exception):
    def __init__(self, code, message):
        super().__init__(f"{code} {message}")
        self.code = code


class FakeResponse:
    def __init__(self, text):
        self.text = text


class FakeModels:
    def __init__(self, outcomes):
        # model name -> list of outcomes consumed in order (exception or response text)
        self._outcomes = outcomes
        self.calls = []

    def generate_content(self, model, contents, config):
        self.calls.append(model)
        outcome = self._outcomes[model].pop(0)
        if isinstance(outcome, Exception):
            raise outcome
        return FakeResponse(outcome)


class FakeClient:
    def __init__(self, outcomes):
        self.models = FakeModels(outcomes)


@pytest.fixture
def fake_client(monkeypatch, settings):
    settings.GEMINI_MODEL = "primary"
    settings.GEMINI_FALLBACK_MODELS = ["fallback-a", "fallback-b"]
    monkeypatch.setattr(gemini_client.time, "sleep", lambda seconds: None)

    def install(outcomes):
        client = FakeClient(outcomes)
        monkeypatch.setattr(gemini_client, "_get_client", lambda: client)
        return client

    return install


QUESTIONS_JSON = '{"questions": ["Q1", "Q2"]}'
OVERLOADED = FakeAPIError(503, "UNAVAILABLE high demand")


def test_falls_back_to_next_model_when_primary_is_overloaded(fake_client):
    client = fake_client({
        "primary": [OVERLOADED, OVERLOADED],
        "fallback-a": [QUESTIONS_JSON],
    })

    assert gemini_client.generate_questions("Web Developer", 2) == ["Q1", "Q2"]
    assert client.models.calls == ["primary", "primary", "fallback-a"]


def test_retry_on_primary_succeeds_without_touching_fallbacks(fake_client):
    client = fake_client({"primary": [OVERLOADED, QUESTIONS_JSON]})

    assert gemini_client.generate_questions("Web Developer", 2) == ["Q1", "Q2"]
    assert client.models.calls == ["primary", "primary"]


def test_non_transient_error_fails_immediately(fake_client):
    client = fake_client({"primary": [FakeAPIError(400, "INVALID_ARGUMENT bad request")]})

    with pytest.raises(gemini_client.GeminiClientError) as excinfo:
        gemini_client.generate_questions("Web Developer", 2)

    assert not isinstance(excinfo.value, gemini_client.GeminiRateLimitError)
    assert client.models.calls == ["primary"]


def test_all_models_busy_raises_friendly_rate_limit_error(fake_client):
    fake_client({
        "primary": [OVERLOADED, FakeAPIError(429, "RESOURCE_EXHAUSTED")],
        "fallback-a": [OVERLOADED],
        "fallback-b": [OVERLOADED],
    })

    with pytest.raises(gemini_client.GeminiRateLimitError, match="busy"):
        gemini_client._generate("prompt", QuestionList)


def test_stops_trying_once_past_the_deadline(fake_client, monkeypatch):
    client = fake_client({"primary": [OVERLOADED], "fallback-a": [], "fallback-b": []})
    clock = iter([0.0, 0.0, 25.0])  # start, first attempt check, second attempt check
    monkeypatch.setattr(gemini_client.time, "monotonic", lambda: next(clock))

    with pytest.raises(gemini_client.GeminiRateLimitError):
        gemini_client._generate("prompt", QuestionList)

    assert client.models.calls == ["primary"]
