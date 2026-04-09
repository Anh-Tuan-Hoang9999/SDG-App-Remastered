from unittest.mock import patch
from uuid import uuid4

from auth import hash_password, verify_password
from models.password_reset_code import PasswordResetCode
from models.user import User


def _email():
    return f"reset_{uuid4().hex[:8]}@trentu.ca"


def _create_user(db, email):
    user = User(
        name="Reset User",
        email=email,
        password_hash=hash_password("OldPass@123"),
        role="student",
    )
    db.add(user)
    db.commit()
    return user


def _request_reset(client, email):
    return client.post("/api/auth/request-password-reset", json={"email": email})


def _verify_reset(client, email, code):
    return client.post("/api/auth/verify-password-reset-code", json={"email": email, "code": code})


def _confirm_reset(client, email, reset_token, new_password="NewPass@123"):
    return client.post(
        "/api/auth/reset-password",
        json={"email": email, "reset_token": reset_token, "new_password": new_password},
    )


class TestPasswordReset:
    def test_request_reset_returns_generic_message_for_unknown_email(self, client):
        response = _request_reset(client, _email())
        assert response.status_code == 201
        assert "if an account exists" in response.json()["message"].lower()

    def test_request_reset_rejects_non_trentu_email(self, client):
        response = _request_reset(client, "someone@gmail.com")
        assert response.status_code == 400
        assert "@trentu.ca" in response.json()["detail"]

    def test_request_reset_sends_email_for_existing_user(self, client, db):
        email = _email()
        _create_user(db, email)

        with patch("api.auth.send_password_reset_email") as mock_send:
            mock_send.return_value = True
            response = _request_reset(client, email)

        assert response.status_code == 201
        mock_send.assert_called_once()
        record = db.query(PasswordResetCode).filter(PasswordResetCode.email == email).first()
        assert record is not None
        assert record.verified is False
        assert record.used is False

    def test_verify_reset_code_returns_reset_token(self, client, db):
        email = _email()
        _create_user(db, email)

        with patch("api.auth.send_password_reset_email") as mock_send:
            mock_send.return_value = True
            _request_reset(client, email)
            code = mock_send.call_args[0][1]

        response = _verify_reset(client, email, code)
        assert response.status_code == 200
        assert response.json()["verified"] is True
        assert response.json()["reset_token"]

    def test_reset_password_updates_password_and_consumes_code(self, client, db):
        email = _email()
        user = _create_user(db, email)

        with patch("api.auth.send_password_reset_email") as mock_send:
            mock_send.return_value = True
            _request_reset(client, email)
            code = mock_send.call_args[0][1]

        verify_response = _verify_reset(client, email, code)
        reset_token = verify_response.json()["reset_token"]

        response = _confirm_reset(client, email, reset_token)
        assert response.status_code == 200
        assert "updated successfully" in response.json()["message"].lower()

        db.refresh(user)
        assert verify_password("NewPass@123", user.password_hash) is True

        record = db.query(PasswordResetCode).filter(PasswordResetCode.email == email).first()
        db.refresh(record)
        assert record.used is True

    def test_reset_password_rejects_bad_reset_token(self, client, db):
        email = _email()
        _create_user(db, email)

        with patch("api.auth.send_password_reset_email") as mock_send:
            mock_send.return_value = True
            _request_reset(client, email)
            code = mock_send.call_args[0][1]

        _verify_reset(client, email, code)
        response = _confirm_reset(client, email, "wrong-token")
        assert response.status_code == 400
        assert "invalid password reset session" in response.json()["detail"].lower()
