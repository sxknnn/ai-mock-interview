"""Clerk session-token verification.

Verifies the RS256 JWT Clerk's frontend SDK attaches as a Bearer token,
against Clerk's public JWKS. No Clerk secret key is needed for this —
JWKS is public key material. jwt.PyJWKClient handles caching + unknown-kid
key rotation correctly (a hand-rolled cache would silently serve stale keys
on rotation), and persists across warm Lambda containers since it's a
module-level singleton.
"""

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

_jwk_client = None


def _get_jwk_client():
    global _jwk_client
    if _jwk_client is None:
        if not settings.CLERK_JWKS_URL:
            raise AuthenticationFailed("Server is missing CLERK_JWKS_URL configuration.")
        _jwk_client = jwt.PyJWKClient(settings.CLERK_JWKS_URL, cache_keys=True)
    return _jwk_client


class ClerkUser:
    """Minimal stand-in for a Django user — there is no auth/contrib app or DB here."""

    is_authenticated = True

    def __init__(self, user_id: str, claims: dict):
        self.id = user_id
        self.claims = claims

    def __str__(self):
        return self.id


class ClerkJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None

        token = header[len("Bearer "):].strip()
        if not token:
            return None

        try:
            signing_key = _get_jwk_client().get_signing_key_from_jwt(token)
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer=settings.CLERK_ISSUER or None,
                leeway=5,
                options={"require": ["exp", "iat", "sub"]},
            )
        except jwt.exceptions.PyJWKClientError as exc:
            raise AuthenticationFailed(f"Could not resolve signing key: {exc}") from exc
        except jwt.exceptions.InvalidTokenError as exc:
            raise AuthenticationFailed(f"Invalid token: {exc}") from exc

        if settings.ALLOWED_AZP:
            azp = claims.get("azp")
            if azp not in settings.ALLOWED_AZP:
                raise AuthenticationFailed("Token was not issued for an allowed client.")

        user_id = claims["sub"]
        return (ClerkUser(user_id, claims), token)

    def authenticate_header(self, request):
        return "Bearer"
