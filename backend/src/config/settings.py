import os

# Real deployments must set DJANGO_SECRET_KEY; this fallback only avoids friction
# for local dev/tests and is obviously not a secret.
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-local-dev-only")
DEBUG = os.environ.get("DJANGO_DEBUG") == "1"
ALLOWED_HOSTS = ["*"]  # Function URL / local dev only; no Host-header spoofing surface here

INSTALLED_APPS = [
    "rest_framework",
    "interviews",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

DATABASES = {}

ROOT_URLCONF = "config.urls"
ASGI_APPLICATION = "config.asgi.application"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "interviews.authentication.ClerkJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "EXCEPTION_HANDLER": "rest_framework.views.exception_handler",
    # DRF's default UNAUTHENTICATED_USER is django.contrib.auth.models.AnonymousUser,
    # importing which defines Permission/Group models that need contenttypes/auth in
    # INSTALLED_APPS — neither is installed here, so that import blows up with a 500
    # on any request with no/failed auth. None makes DRF just set request.user = None,
    # which IsAuthenticated still correctly treats as not authenticated (401).
    "UNAUTHENTICATED_USER": None,
}

CLERK_JWKS_URL = os.environ.get("CLERK_JWKS_URL", "")
CLERK_ISSUER = os.environ.get("CLERK_ISSUER", "")
ALLOWED_AZP = [v for v in os.environ.get("ALLOWED_AZP", "").split(",") if v]

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME", "InterviewlySessions")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
DYNAMODB_ENDPOINT_URL = os.environ.get("DYNAMODB_ENDPOINT_URL") or None  # set for local/moto use

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")
# Tried in order when the primary model is rate-limited or overloaded.
GEMINI_FALLBACK_MODELS = [
    m.strip()
    for m in os.environ.get("GEMINI_FALLBACK_MODELS", "gemini-3.5-flash,gemini-3.1-flash-lite").split(",")
    if m.strip()
]

INTERVIEW_QUESTION_COUNT = int(os.environ.get("INTERVIEW_QUESTION_COUNT", "5"))
SESSION_TTL_DAYS = int(os.environ.get("SESSION_TTL_DAYS", "90"))
