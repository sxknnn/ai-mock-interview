"""Single-table DynamoDB access for interview sessions.

Table: PK = USER#<clerkUserId>, SK = SESSION#<sessionId>#META  (session metadata)
                                 or SESSION#<sessionId>#Q#<NNN> (one item per question)

No GSI — both access patterns (list a user's sessions, fetch one full session)
are satisfied by Query on the base table alone, which keeps us comfortably
inside the DynamoDB Always-Free provisioned-capacity allowance.
"""

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import boto3
from django.conf import settings

_table = None


def _get_table():
    global _table
    if _table is None:
        kwargs = {"region_name": settings.AWS_REGION}
        if settings.DYNAMODB_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.DYNAMODB_ENDPOINT_URL
        resource = boto3.resource("dynamodb", **kwargs)
        _table = resource.Table(settings.DYNAMODB_TABLE_NAME)
    return _table


def _question_sk(session_id: str, index: int) -> str:
    return f"SESSION#{session_id}#Q#{index:03d}"


def _meta_sk(session_id: str) -> str:
    return f"SESSION#{session_id}#META"


def _ttl_epoch() -> int:
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.SESSION_TTL_DAYS)
    return int(expires_at.timestamp())


def create_session(user_id: str, role_id: str, role_title: str, questions: list[str]) -> dict:
    session_id = uuid.uuid4().hex[:12]
    now = datetime.now(timezone.utc).isoformat()
    ttl = _ttl_epoch()
    table = _get_table()

    with table.batch_writer() as batch:
        batch.put_item(Item={
            "PK": f"USER#{user_id}",
            "SK": _meta_sk(session_id),
            "sessionId": session_id,
            "roleId": role_id,
            "roleTitle": role_title,
            "status": "in_progress",
            "questionCount": len(questions),
            "overallScore": None,
            "overallSummary": None,
            "createdAt": now,
            "updatedAt": now,
            "ttl": ttl,
        })
        for index, question_text in enumerate(questions, start=1):
            batch.put_item(Item={
                "PK": f"USER#{user_id}",
                "SK": _question_sk(session_id, index),
                "questionIndex": index,
                "questionText": question_text,
                "answerText": None,
                "score": None,
                "strengths": None,
                "improvements": None,
                "answeredAt": None,
                "ttl": ttl,
            })

    return {
        "sessionId": session_id,
        "roleId": role_id,
        "roleTitle": role_title,
        "status": "in_progress",
        "questions": [
            {"questionIndex": i, "questionText": q}
            for i, q in enumerate(questions, start=1)
        ],
    }


def list_sessions(user_id: str) -> list[dict]:
    table = _get_table()
    response = table.query(
        KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
        ExpressionAttributeValues={":pk": f"USER#{user_id}", ":sk_prefix": "SESSION#"},
    )
    return [item for item in response.get("Items", []) if item["SK"].endswith("#META")]


def get_session(user_id: str, session_id: str) -> dict | None:
    table = _get_table()
    response = table.query(
        KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
        ExpressionAttributeValues={
            ":pk": f"USER#{user_id}",
            ":sk_prefix": f"SESSION#{session_id}#",
        },
    )
    items = response.get("Items", [])
    meta = next((i for i in items if i["SK"].endswith("#META")), None)
    if meta is None:
        return None

    questions = sorted(
        (i for i in items if not i["SK"].endswith("#META")),
        key=lambda i: i["questionIndex"],
    )
    return {"meta": meta, "questions": questions}


def save_answers(user_id: str, session_id: str, answers: dict[int, str]) -> None:
    table = _get_table()
    now = datetime.now(timezone.utc).isoformat()
    for index, answer_text in answers.items():
        table.update_item(
            Key={"PK": f"USER#{user_id}", "SK": _question_sk(session_id, index)},
            UpdateExpression="SET answerText = :a, answeredAt = :t",
            ExpressionAttributeValues={":a": answer_text, ":t": now},
        )


def save_feedback(
    user_id: str,
    session_id: str,
    per_question_feedback: list[dict],
    overall_score: int,
    overall_summary: str,
) -> None:
    table = _get_table()
    now = datetime.now(timezone.utc).isoformat()

    for feedback in per_question_feedback:
        table.update_item(
            Key={"PK": f"USER#{user_id}", "SK": _question_sk(session_id, feedback["questionIndex"])},
            UpdateExpression="SET score = :s, strengths = :st, improvements = :im",
            ExpressionAttributeValues={
                ":s": Decimal(str(feedback["score"])),
                ":st": feedback["strengths"],
                ":im": feedback["improvements"],
            },
        )

    table.update_item(
        Key={"PK": f"USER#{user_id}", "SK": _meta_sk(session_id)},
        UpdateExpression="SET #status = :done, overallScore = :score, overallSummary = :summary, updatedAt = :t",
        ExpressionAttributeNames={"#status": "status"},
        ExpressionAttributeValues={
            ":done": "completed",
            ":score": Decimal(str(overall_score)),
            ":summary": overall_summary,
            ":t": now,
        },
    )
