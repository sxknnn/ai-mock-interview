# Interviewly API

Django REST Framework, deployed as a Lambda function (via Mangum) behind a
free Lambda Function URL, backed by DynamoDB, using Gemini to generate
interview questions and grade answers.

## Local development

```bash
pip install -r requirements-dev.txt

# from backend/, with these env vars set (see .env.example):
#   DJANGO_SECRET_KEY, CLERK_JWKS_URL, CLERK_ISSUER, GEMINI_API_KEY
#   DYNAMODB_TABLE_NAME, DYNAMODB_ENDPOINT_URL (point at DynamoDB Local or a real table), AWS_REGION
python -m pytest -q

cd src
uvicorn config.asgi:application --reload --port 8000
```

`GET http://localhost:8000/api/roles/` should return 70+ roles (requires a
valid Clerk Bearer token on every request, including this one).

## Deploy to AWS (free tier)

Prerequisites: signed in via `aws login --profile interviewly` (credentials
valid 12h, renewable 90 days without re-opening a browser), Docker Desktop
running, AWS SAM CLI installed. `samconfig.toml` already points deploys at
the `interviewly` profile and `us-east-2` (this project's assigned Region).

```bash
sam build --use-container --build-image public.ecr.aws/sam/build-python3.12:1.150.0-x86_64
sam deploy --guided
```

The build image is pinned because `build-python3.12:latest-x86_64` (published
2026-10-14) ships an empty `lambda-builders` entrypoint and fails with
`exec format error`. Runtime dependencies live in `src/requirements.txt` so
SAM finds them next to `CodeUri`.

On first run, `sam deploy --guided` will prompt for the parameters in
`template.yaml` (Clerk JWKS URL/issuer, Gemini API key, your frontend origin
for CORS, etc.) and save them to `samconfig.toml` for next time.

Take the `FunctionUrl` output and set it as `VITE_API_BASE_URL` in the
frontend's `.env.local`.

### Cost posture

Every resource here is deliberately sized to stay inside AWS's **Always
Free** tier, not just a 12-month trial:

- Lambda: 1M requests + 400,000 GB-seconds/month free, forever.
- Lambda Function URL: no additional charge (and no API Gateway ~29s
  timeout, which matters with a Gemini call in the request path).
- DynamoDB: provisioned at 5/5 RCU-WCU, well under the 25/25 free allowance,
  and provisioned mode throttles instead of silently billing for bursts.
- CloudWatch Logs: explicit 14-day retention (default is infinite).
- Gemini: free-tier model, 2 calls per completed interview (1 to generate
  questions, 1 batched call to grade the whole session).

This account uses AWS's project-based experience, where spend limits and
billing alerts are managed centrally in AWS Settings (settings.aws.com) —
not via a self-rolled CloudWatch billing alarm, which is why there isn't
one in `template.yaml`.
