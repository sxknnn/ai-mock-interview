import pytest
from rest_framework.test import APIRequestFactory, force_authenticate

from interviews import dynamo, gemini_client, views
from interviews.authentication import ClerkUser
from interviews.schemas import QuestionFeedback, SessionFeedback
from interviews.testing import FakeDynamoTable


@pytest.fixture
def dynamo_table(monkeypatch):
    fake = FakeDynamoTable()
    monkeypatch.setattr(dynamo, "_get_table", lambda: fake)
    return fake


@pytest.fixture
def test_user():
    return ClerkUser("user_abc", {"sub": "user_abc"})


def _fake_questions(role_title, count):
    return [f"Question {i} for {role_title}" for i in range(1, count + 1)]


def test_roles_list_without_token_is_401_not_500():
    factory = APIRequestFactory()
    request = factory.get("/api/roles/")
    response = views.RolesListView.as_view()(request)

    assert response.status_code == 401


def test_roles_list_returns_70_plus_roles(test_user):
    factory = APIRequestFactory()
    request = factory.get("/api/roles/")
    force_authenticate(request, user=test_user)
    response = views.RolesListView.as_view()(request)

    assert response.status_code == 200
    assert len(response.data["roles"]) >= 70


def test_start_session_creates_questions(dynamo_table, test_user, monkeypatch):
    monkeypatch.setattr(gemini_client, "generate_questions", _fake_questions)

    factory = APIRequestFactory()
    request = factory.post("/api/sessions/", {"roleId": "backend-engineer"}, format="json")
    force_authenticate(request, user=test_user)
    response = views.SessionListCreateView.as_view()(request)

    assert response.status_code == 201
    assert response.data["roleTitle"] == "Backend Engineer"
    assert len(response.data["questions"]) == 5


def test_start_session_unknown_role_is_400(dynamo_table, test_user):
    factory = APIRequestFactory()
    request = factory.post("/api/sessions/", {"roleId": "not-a-real-role"}, format="json")
    force_authenticate(request, user=test_user)
    response = views.SessionListCreateView.as_view()(request)

    assert response.status_code == 400


def test_start_session_surfaces_rate_limit_as_503(dynamo_table, test_user, monkeypatch):
    def _raise_rate_limit(role_title, count):
        raise gemini_client.GeminiRateLimitError("rate limited")

    monkeypatch.setattr(gemini_client, "generate_questions", _raise_rate_limit)

    factory = APIRequestFactory()
    request = factory.post("/api/sessions/", {"roleId": "backend-engineer"}, format="json")
    force_authenticate(request, user=test_user)
    response = views.SessionListCreateView.as_view()(request)

    assert response.status_code == 503


def test_submit_session_saves_feedback(dynamo_table, test_user, monkeypatch):
    monkeypatch.setattr(gemini_client, "generate_questions", _fake_questions)

    factory = APIRequestFactory()
    create_request = factory.post("/api/sessions/", {"roleId": "backend-engineer"}, format="json")
    force_authenticate(create_request, user=test_user)
    create_response = views.SessionListCreateView.as_view()(create_request)
    session_id = create_response.data["sessionId"]
    question_count = len(create_response.data["questions"])

    fake_feedback = SessionFeedback(
        overallScore=8,
        overallSummary="Solid performance overall.",
        perQuestion=[
            QuestionFeedback(
                questionIndex=i,
                score=8,
                strengths=["Clear communication"],
                improvements=["Add more specifics"],
            )
            for i in range(1, question_count + 1)
        ],
    )
    monkeypatch.setattr(
        gemini_client, "grade_session", lambda role_title, questions, answers: fake_feedback
    )

    answers = [{"questionIndex": i, "text": f"Answer {i}"} for i in range(1, question_count + 1)]
    submit_request = factory.post(
        f"/api/sessions/{session_id}/submit/", {"answers": answers}, format="json"
    )
    force_authenticate(submit_request, user=test_user)
    submit_response = views.SubmitSessionView.as_view()(submit_request, session_id=session_id)

    assert submit_response.status_code == 200
    assert submit_response.data["status"] == "completed"
    assert submit_response.data["overallScore"] == 8
    assert submit_response.data["questions"][0]["answerText"] == "Answer 1"
    assert submit_response.data["questions"][0]["score"] == 8


def test_session_detail_404_for_unknown_session(dynamo_table, test_user):
    factory = APIRequestFactory()
    request = factory.get("/api/sessions/does-not-exist/")
    force_authenticate(request, user=test_user)
    response = views.SessionDetailView.as_view()(request, session_id="does-not-exist")

    assert response.status_code == 404
