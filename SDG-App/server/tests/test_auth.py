import time
import asyncio
from datetime import timedelta
import auth
from jose import jwt
from jose import JWTError
import pytest

EMAIL = "student@trentu.ca" # example email for testing
PASSWORD = "MyPassword@123" # strong password for testing

# helper function to decode JWT tokens for testing purposes
def decode_token(token):
    return jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])

# makes sure the hashed password isn't just stored as plain text
def test_password_hash_is_not_plain_text():
    hashed = auth.get_password_hash(PASSWORD)
    assert hashed != PASSWORD
    assert isinstance(hashed, str)
    assert hashed.strip() != ""

# checks that the correct password passes verification against its hash
def test_verify_password_returns_true_for_correct_password():
    hashed = auth.get_password_hash(PASSWORD)
    assert auth.verify_password(PASSWORD, hashed) is True

# checks that a wrong password fails verification
def test_verify_password_returns_false_for_wrong_password():
    hashed = auth.get_password_hash(PASSWORD)
    assert auth.verify_password("WrongPass123!", hashed) is False

# makes sure the email we pass in actually ends up in the token
def test_create_access_token_includes_subject():
    token = auth.create_access_token({"sub": EMAIL})
    payload = decode_token(token)
    assert payload["sub"] == EMAIL

# makes sure the token has an expiry and that it's set in the future
def test_create_access_token_includes_expiration_in_future():
    token = auth.create_access_token({"sub": EMAIL})
    payload = decode_token(token)
    assert "exp" in payload
    assert payload["exp"] > int(time.time())


# an empty string should never be a valid password
def test_verify_password_returns_false_for_empty_password():
    hashed = auth.get_password_hash(PASSWORD)
    assert auth.verify_password("", hashed) is False

# hashing the same password twice should give different results due to salting
# but both hashes should still verify correctly against the original password
def test_same_password_produces_different_hashes():
    hash_a = auth.get_password_hash(PASSWORD)
    hash_b = auth.get_password_hash(PASSWORD)
    assert hash_a != hash_b
    assert auth.verify_password(PASSWORD, hash_a) is True
    assert auth.verify_password(PASSWORD, hash_b) is True

# checks that a token with an overridden expiry is invalid once expired
def test_create_access_token_expiry_override_expires_token():
    token = auth.create_access_token(
        {"sub": EMAIL}, expires_delta=timedelta(seconds=-1)
    )
    with pytest.raises(JWTError):
        decode_token(token)


# fake db classes to simulate a database without actually connecting to one
class _DummyQuery:
    def __init__(self, user):
        self.user = user

    def filter(self, *_args, **_kwargs):
        return self

    def first(self):
        return self.user


class _DummyDB:
    def __init__(self, user):
        self.user = user

    def query(self, *_args, **_kwargs):
        return _DummyQuery(self.user)


# a token missing the "sub" field should be rejected with a 401
def test_get_current_user_rejects_token_without_sub():
    token_without_sub = auth.create_access_token({"role": "student"})
    with pytest.raises(auth.HTTPException) as exc:
        asyncio.run(auth.get_current_user(token=token_without_sub, db=_DummyDB(object())))
    assert exc.value.status_code == 401
    assert exc.value.detail == "Could not validate credentials"


# a token that has been tampered with should be rejected with a 401
def test_get_current_user_rejects_tampered_token():
    valid_token = auth.create_access_token({"sub": EMAIL})
    tampered_token = valid_token + "tamper"
    with pytest.raises(auth.HTTPException) as exc:
        asyncio.run(auth.get_current_user(token=tampered_token, db=_DummyDB(object())))
    assert exc.value.status_code == 401
    assert exc.value.detail == "Could not validate credentials"