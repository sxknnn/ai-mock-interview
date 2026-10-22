"""Local end-to-end smoke test.

Runs the real Django/DRF app (same ASGI app Mangum wraps in Lambda) over a
real local HTTP server. Only the two things we don't have credentials for
yet are stubbed: Gemini and real AWS DynamoDB. Clerk JWT verification is
NOT stubbed — it runs for real against a JWKS server this script spins up
on localhost, using a throwaway RSA keypair.

Usage:
    python scripts/smoke_server.py

Then, in another terminal, use the printed Authorization header to curl
http://127.0.0.1:8000/api/roles/ (and the rest of the flow).
"""

import http.server
import json
import os
import sys
import threading
import time
from pathlib import Path

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
sys.path.insert(0, str(SRC_DIR))

JWKS_PORT = 9823
APP_PORT = 8000

os.environ.setdefault("DJANGO_SECRET_KEY", "smoke-test-secret")
os.environ["CLERK_ISSUER"] = f"http://127.0.0.1:{JWKS_PORT}"
os.environ["CLERK_JWKS_URL"] = f"http://127.0.0.1:{JWKS_PORT}/.well-known/jwks.json"
os.environ.setdefault("ALLOWED_AZP", "")
os.environ.setdefault("GEMINI_API_KEY", "unused-in-smoke-test")
os.environ.setdefault("GEMINI_MODEL", "gemini-3.8-flash")
os.environ.setdefault("DYNAMODB_TABLE_NAME", "SmokeTestSessions")
os.environ.setdefault("AWS_REGION", "us-east-1")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import jwt  # noqa: E402
from cryptography.hazmat.primitives.asymmetric import rsa  # noqa: E402
from jwt.algorithms import RSAAlgorithm  # noqa: E402


def _build_jwks_and_token():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    jwk = json.loads(RSAAlgorithm.to_jwk(private_key.public_key()))
    jwk.update({"kid": "smoke-test-key", "use": "sig", "alg": "RS256"})
    jwks = {"keys": [jwk]}

    now = int(time.time())
    token = jwt.encode(
        {
            "sub": "user_smoke_test",
            "iss": os.environ["CLERK_ISSUER"],
            "iat": now,
            "exp": now + 3600,
        },
        private_key,
        algorithm="RS256",
        headers={"kid": "smoke-test-key"},
    )
    return jwks, token


def _serve_jwks(jwks: dict):
    jwks_body = json.dumps(jwks).encode()

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(jwks_body)

        def log_message(self, *args):
            pass

    server = http.server.ThreadingHTTPServer(("127.0.0.1", JWKS_PORT), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()


def _stub_external_services():
    from interviews import dynamo, gemini_client
    from interviews.schemas import QuestionFeedback, SessionFeedback
    from interviews.testing import FakeDynamoTable

    fake_table = FakeDynamoTable()
    dynamo._get_table = lambda: fake_table

    def fake_generate_questions(role_title, count):
        return [
            f"[stubbed] Tell me about a challenge you solved as a {role_title} (Q{i})."
            for i in range(1, count + 1)
        ]

    def fake_grade_session(role_title, questions, answers):
        return SessionFeedback(
            overallScore=7,
            overallSummary=f"[stubbed feedback] Reasonable answers for a {role_title} interview.",
            perQuestion=[
                QuestionFeedback(
                    questionIndex=i,
                    score=7,
                    strengths=["Clear structure"],
                    improvements=["Add a concrete example"],
                )
                for i in range(1, len(questions) + 1)
            ],
        )

    gemini_client.generate_questions = fake_generate_questions
    gemini_client.grade_session = fake_grade_session


def main():
    jwks, token = _build_jwks_and_token()
    _serve_jwks(jwks)

    from config.asgi import application

    _stub_external_services()

    print("=" * 70)
    print(f"Smoke server on http://127.0.0.1:{APP_PORT}")
    print("Gemini + DynamoDB are stubbed; Clerk JWT verification is real")
    print("(against a local JWKS server with a throwaway RSA key).")
    print()
    print("Bearer token for curl:")
    print(token)
    print("=" * 70)

    import uvicorn

    uvicorn.run(application, host="127.0.0.1", port=APP_PORT, log_level="info")


if __name__ == "__main__":
    main()
