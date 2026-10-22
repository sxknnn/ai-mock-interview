from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from . import dynamo, gemini_client
from .roles import JOB_ROLES, JOB_ROLES_BY_ID
from .serializers import StartSessionRequestSerializer, SubmitAnswersRequestSerializer


class RolesListView(APIView):
    def get(self, request):
        return Response({"roles": JOB_ROLES})


class SessionListCreateView(APIView):
    def get(self, request):
        sessions = dynamo.list_sessions(request.user.id)
        return Response({"sessions": [_serialize_meta(m) for m in sessions]})

    def post(self, request):
        serializer = StartSessionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role_id = serializer.validated_data["roleId"]

        role = JOB_ROLES_BY_ID.get(role_id)
        if role is None:
            return Response({"detail": "Unknown roleId."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            questions = gemini_client.generate_questions(role["title"], settings.INTERVIEW_QUESTION_COUNT)
        except gemini_client.GeminiRateLimitError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except gemini_client.GeminiClientError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        session = dynamo.create_session(request.user.id, role_id, role["title"], questions)
        return Response(session, status=status.HTTP_201_CREATED)


class SessionDetailView(APIView):
    def get(self, request, session_id):
        record = dynamo.get_session(request.user.id, session_id)
        if record is None:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize_session(record))


class SubmitSessionView(APIView):
    def post(self, request, session_id):
        record = dynamo.get_session(request.user.id, session_id)
        if record is None:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SubmitAnswersRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answers_by_index = {
            a["questionIndex"]: a["text"] for a in serializer.validated_data["answers"]
        }

        questions_sorted = sorted(record["questions"], key=lambda q: q["questionIndex"])
        question_texts = [q["questionText"] for q in questions_sorted]
        answer_texts = [answers_by_index.get(q["questionIndex"], "") for q in questions_sorted]

        dynamo.save_answers(request.user.id, session_id, answers_by_index)

        try:
            feedback = gemini_client.grade_session(
                record["meta"]["roleTitle"], question_texts, answer_texts
            )
        except gemini_client.GeminiRateLimitError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except gemini_client.GeminiClientError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        per_question = [fb.model_dump() for fb in feedback.perQuestion]
        dynamo.save_feedback(
            request.user.id,
            session_id,
            per_question,
            feedback.overallScore,
            feedback.overallSummary,
        )

        updated = dynamo.get_session(request.user.id, session_id)
        return Response(_serialize_session(updated))


def _serialize_meta(meta: dict) -> dict:
    return {
        "sessionId": meta["sessionId"],
        "roleId": meta["roleId"],
        "roleTitle": meta["roleTitle"],
        "status": meta["status"],
        "questionCount": meta["questionCount"],
        "overallScore": meta.get("overallScore"),
        "overallSummary": meta.get("overallSummary"),
        "createdAt": meta["createdAt"],
        "updatedAt": meta["updatedAt"],
    }


def _serialize_session(record: dict) -> dict:
    meta = _serialize_meta(record["meta"])
    meta["questions"] = [
        {
            "questionIndex": q["questionIndex"],
            "questionText": q["questionText"],
            "answerText": q.get("answerText"),
            "score": q.get("score"),
            "strengths": q.get("strengths"),
            "improvements": q.get("improvements"),
        }
        for q in sorted(record["questions"], key=lambda q: q["questionIndex"])
    ]
    return meta
