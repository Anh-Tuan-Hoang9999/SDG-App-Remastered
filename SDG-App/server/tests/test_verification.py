"""Tests for email-verification endpoints and registration enforcement.

These tests explicitly disable SKIP_EMAIL_VERIFICATION so the full
verification gate on /register is exercised.
"""
import os
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from uuid import uuid4

import pytest

from models.email_verification import EmailVerification

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

TRENTU_EMAIL = "verify_test@trentu.ca"
NON_TRENTU   = "verify_test@gmail.com"


def _email():
    return f"vtest_{uuid4().hex[:8]}@trentu.ca"


def _send(client, email=None):
    return client.post(
        "/api/auth/send-verification-code",
        json={"email": email or TRENTU_EMAIL},
    )


def _verify(client, code, email=None):
    return client.post(
        "/api/auth/verify-code",
        json={"email": email or TRENTU_EMAIL, "code": code},
    )


def _register(client, email=None, name="Test User"):
    em = email or TRENTU_EMAIL
    return client.post(
        "/api/auth/register",
        json={"name": name, "email": em, "password": "Pass@1234"},
    )


# ---------------------------------------------------------------------------
# send-verification-code
# ---------------------------------------------------------------------------

class TestSendVerificationCode:
    def test_rejects_non_trentu_email(self, client):
        r = _send(client, NON_TRENTU)
        assert r.status_code == 400
        assert "@trentu.ca" in r.json()["detail"]

    def test_returns_201_for_trentu_email(self, client):
        r = _send(client, _email())
        assert r.status_code == 201

    def test_rejects_already_registered_email(self, client):
        em = _email()
        _send(client, em)
        # Register directly (SKIP_EMAIL_VERIFICATION=true in conftest)
        client.post("/api/auth/register", json={"name": "X", "email": em, "password": "Pass@1234"})
        r = _send(client, em)
        assert r.status_code == 400
        assert "already registered" in r.json()["detail"].lower()

    def test_stores_hashed_code_in_db(self, client, db):
        em = _email()
        _send(client, em)
        record = db.query(EmailVerification).filter(EmailVerification.email == em).first()
        assert record is not None
        assert record.code_hash != ""
        assert record.verified is False
        assert record.used is False

    def test_rate_limit_blocks_immediate_resend(self, client):
        em = _email()
        _send(client, em)          # first send — ok
        r = _send(client, em)      # immediate resend — should be rate-limited
        assert r.status_code == 429
        assert "wait" in r.json()["detail"].lower()

    def test_email_service_called(self, client):
        """send_verification_email must be invoked (mocked to avoid real I/O)."""
        em = _email()
        with patch("api.auth.send_verification_email") as mock_send:
            mock_send.return_value = True
            r = _send(client, em)
        assert r.status_code == 201
        mock_send.assert_called_once()
        args = mock_send.call_args[0]
        assert args[0] == em          # to_email
        assert len(args[1]) == 6      # 6-digit code
        assert args[1].isdigit()

    def test_returns_503_when_email_delivery_fails(self, client):
        em = _email()
        with patch("api.auth.send_verification_email") as mock_send:
            mock_send.return_value = False
            r = _send(client, em)
        assert r.status_code == 503
        assert "could not be sent" in r.json()["detail"].lower()


# ---------------------------------------------------------------------------
# verify-code
# ---------------------------------------------------------------------------

class TestVerifyCode:
    def test_valid_code_returns_verified_true(self, client):
        em = _email()
        with patch("api.auth.send_verification_email") as mock_send:
            mock_send.return_value = True
            _send(client, em)
            code = mock_send.call_args[0][1]
        r = _verify(client, code, em)
        assert r.status_code == 200
        assert r.json()["verified"] is True

    def test_wrong_code_returns_400(self, client):
        em = _email()
        with patch("api.auth.send_verification_email"):
            _send(client, em)
        r = _verify(client, "000000", em)
        assert r.status_code == 400
        assert "invalid" in r.json()["detail"].lower()

    def test_no_pending_record_returns_400(self, client):
        em = _email()
        r = _verify(client, "123456", em)
        assert r.status_code == 400
        assert "no pending" in r.json()["detail"].lower()

    def test_expired_code_returns_400(self, client, db):
        em = _email()
        # Insert an already-expired record manually
        record = EmailVerification(
            email=em,
            code_hash="$argon2id$v=19$m=65536,t=3,p=4$placeholder",
            expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        )
        db.add(record)
        db.commit()
        r = _verify(client, "123456", em)
        assert r.status_code == 400
        assert "expired" in r.json()["detail"].lower()

    def test_code_marked_verified_after_success(self, client, db):
        em = _email()
        with patch("api.auth.send_verification_email") as mock_send:
            mock_send.return_value = True
            _send(client, em)
            code = mock_send.call_args[0][1]
        _verify(client, code, em)
        record = db.query(EmailVerification).filter(EmailVerification.email == em).first()
        db.refresh(record)
        assert record.verified is True

    def test_three_wrong_attempts_lock_verification_record(self, client, db):
        em = _email()
        with patch("api.auth.send_verification_email"):
            _send(client, em)

        first = _verify(client, "000000", em)
        second = _verify(client, "000000", em)
        third = _verify(client, "000000", em)

        assert first.status_code == 400
        assert "invalid" in first.json()["detail"].lower()
        assert second.status_code == 400
        assert "invalid" in second.json()["detail"].lower()
        assert third.status_code == 400
        assert "too many invalid verification attempts" in third.json()["detail"].lower()

        record = db.query(EmailVerification).filter(EmailVerification.email == em).first()
        db.refresh(record)
        assert record.failed_attempts == 3
        assert record.used is True


# ---------------------------------------------------------------------------
# register — with verification gate enabled
# ---------------------------------------------------------------------------

class TestRegisterWithVerification:
    """Run with SKIP_EMAIL_VERIFICATION=false to test the gate."""

    @pytest.fixture(autouse=True)
    def _disable_skip(self, monkeypatch):
        monkeypatch.setenv("SKIP_EMAIL_VERIFICATION", "false")

    def test_register_without_verification_fails(self, client):
        r = _register(client, _email())
        assert r.status_code == 400
        assert "not verified" in r.json()["detail"].lower()

    def test_register_rejects_non_trentu_email(self, client, monkeypatch):
        monkeypatch.setenv("SKIP_EMAIL_VERIFICATION", "false")
        r = _register(client, "someone@gmail.com")
        assert r.status_code == 422
        assert "@trentu.ca" in str(r.json()["detail"])

    def test_register_succeeds_after_verification(self, client):
        em = _email()
        with patch("api.auth.send_verification_email") as mock_send:
            mock_send.return_value = True
            _send(client, em)
            code = mock_send.call_args[0][1]
        _verify(client, code, em)
        r = _register(client, em)
        assert r.status_code == 201
        assert r.json()["email"] == em

    def test_verified_token_consumed_after_registration(self, client, db):
        em = _email()
        with patch("api.auth.send_verification_email") as mock_send:
            mock_send.return_value = True
            _send(client, em)
            code = mock_send.call_args[0][1]
        _verify(client, code, em)
        _register(client, em)
        record = db.query(EmailVerification).filter(EmailVerification.email == em).first()
        db.refresh(record)
        assert record.used is True

    def test_second_register_with_same_token_fails(self, client):
        em = _email()
        with patch("api.auth.send_verification_email") as mock_send:
            mock_send.return_value = True
            _send(client, em)
            code = mock_send.call_args[0][1]
        _verify(client, code, em)
        _register(client, em)
        # Try again — token is consumed, email is taken
        r = _register(client, em)
        assert r.status_code == 400
