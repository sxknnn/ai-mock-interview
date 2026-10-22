import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from interviews import authentication as auth_module
from interviews.authentication import ClerkJWTAuthentication


class FakeSigningKey:
    def __init__(self, key):
        self.key = key


class FakeJWKClient:
    def __init__(self, key):
        self._key = key

    def get_signing_key_from_jwt(self, token):
        return FakeSigningKey(self._key)


@pytest.fixture
def rsa_keypair():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    return private_key, private_key.public_key()


def _request_with_bearer(token):
    factory = APIRequestFactory()
    django_request = factory.get("/api/roles/", HTTP_AUTHORIZATION=f"Bearer {token}")
    return Request(django_request)


def test_authenticate_accepts_valid_token(monkeypatch, rsa_keypair, settings):
    private_key, public_key = rsa_keypair
    settings.CLERK_ISSUER = "https://clerk.test"
    settings.ALLOWED_AZP = []
    monkeypatch.setattr(auth_module, "_jwk_client", FakeJWKClient(public_key))

    token = jwt.encode(
        {
            "sub": "user_123",
            "iss": "https://clerk.test",
            "iat": int(time.time()),
            "exp": int(time.time()) + 60,
        },
        private_key,
        algorithm="RS256",
    )

    user, auth_token = ClerkJWTAuthentication().authenticate(_request_with_bearer(token))

    assert user.id == "user_123"
    assert auth_token == token


def test_authenticate_rejects_expired_token(monkeypatch, rsa_keypair, settings):
    private_key, public_key = rsa_keypair
    settings.CLERK_ISSUER = "https://clerk.test"
    monkeypatch.setattr(auth_module, "_jwk_client", FakeJWKClient(public_key))

    token = jwt.encode(
        {
            "sub": "user_123",
            "iss": "https://clerk.test",
            "iat": int(time.time()) - 120,
            "exp": int(time.time()) - 60,
        },
        private_key,
        algorithm="RS256",
    )

    with pytest.raises(AuthenticationFailed):
        ClerkJWTAuthentication().authenticate(_request_with_bearer(token))


def test_authenticate_rejects_disallowed_azp(monkeypatch, rsa_keypair, settings):
    private_key, public_key = rsa_keypair
    settings.CLERK_ISSUER = "https://clerk.test"
    settings.ALLOWED_AZP = ["https://app.allowed.test"]
    monkeypatch.setattr(auth_module, "_jwk_client", FakeJWKClient(public_key))

    token = jwt.encode(
        {
            "sub": "user_123",
            "iss": "https://clerk.test",
            "azp": "https://evil.test",
            "iat": int(time.time()),
            "exp": int(time.time()) + 60,
        },
        private_key,
        algorithm="RS256",
    )

    with pytest.raises(AuthenticationFailed):
        ClerkJWTAuthentication().authenticate(_request_with_bearer(token))


def test_authenticate_returns_none_without_header():
    factory = APIRequestFactory()
    django_request = factory.get("/api/roles/")
    assert ClerkJWTAuthentication().authenticate(Request(django_request)) is None
