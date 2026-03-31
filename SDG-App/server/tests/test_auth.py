"""Unit tests for the auth module (password hashing & JWT)."""
import time
from datetime import timedelta

import pytest
from jose import JWTError, jwt

import auth

EMAIL    = "student@trentu.ca"
PASSWORD = "MyPassword@123"


def decode(token):
    return jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])


def test_password_hash_is_not_plain_text():
    hashed = auth.hash_password(PASSWORD)
    assert hashed != PASSWORD
    assert isinstance(hashed, str)
    assert hashed.strip() != ""


def test_verify_password_correct():
    hashed = auth.hash_password(PASSWORD)
    assert auth.verify_password(PASSWORD, hashed) is True


def test_verify_password_wrong():
    hashed = auth.hash_password(PASSWORD)
    assert auth.verify_password("WrongPass123!", hashed) is False


def test_verify_empty_password():
    hashed = auth.hash_password(PASSWORD)
    assert auth.verify_password("", hashed) is False


def test_same_password_produces_different_hashes():
    a = auth.hash_password(PASSWORD)
    b = auth.hash_password(PASSWORD)
    assert a != b
    assert auth.verify_password(PASSWORD, a) is True
    assert auth.verify_password(PASSWORD, b) is True


def test_create_access_token_includes_subject():
    token = auth.create_access_token({"sub": EMAIL})
    assert decode(token)["sub"] == EMAIL


def test_create_access_token_includes_future_expiry():
    token = auth.create_access_token({"sub": EMAIL})
    assert decode(token)["exp"] > int(time.time())


def test_expired_token_raises_jwt_error():
    token = auth.create_access_token({"sub": EMAIL}, expires_delta=timedelta(seconds=-1))
    with pytest.raises(JWTError):
        decode(token)


def test_get_current_user_rejects_token_without_sub(client):
    token = auth.create_access_token({"role": "student"})
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401


def test_get_current_user_rejects_tampered_token(client):
    token = auth.create_access_token({"sub": EMAIL}) + "tamper"
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401
