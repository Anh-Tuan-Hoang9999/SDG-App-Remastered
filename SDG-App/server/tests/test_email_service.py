from types import SimpleNamespace
from unittest.mock import patch

import email_service


class TestBrevoEmailService:
    def test_brevo_returns_false_when_not_configured(self, monkeypatch):
        monkeypatch.setattr(email_service, "EMAIL_PROVIDER", "brevo")
        monkeypatch.delenv("BREVO_API_KEY", raising=False)
        monkeypatch.delenv("BREVO_SENDER_EMAIL", raising=False)

        assert email_service.send_verification_email("student@trentu.ca", "123456") is False

    def test_brevo_sends_expected_payload(self, monkeypatch):
        monkeypatch.setattr(email_service, "EMAIL_PROVIDER", "brevo")
        monkeypatch.setenv("BREVO_API_KEY", "brevo_test_key")
        monkeypatch.setenv("BREVO_SENDER_EMAIL", "sender@example.com")
        monkeypatch.setenv("BREVO_SENDER_NAME", "Portal Sender")

        fake_response = SimpleNamespace(status_code=201, text="ok")

        with patch("httpx.post", return_value=fake_response) as mock_post:
            sent = email_service.send_verification_email("student@trentu.ca", "123456")

        assert sent is True
        mock_post.assert_called_once()
        _, kwargs = mock_post.call_args
        assert kwargs["headers"]["api-key"] == "brevo_test_key"
        assert kwargs["json"]["sender"] == {
            "name": "Portal Sender",
            "email": "sender@example.com",
        }
        assert kwargs["json"]["to"] == [{"email": "student@trentu.ca"}]
        assert kwargs["json"]["subject"] == "Your SDG Co-op Portal verification code"
        assert "123456" in kwargs["json"]["textContent"]

    def test_brevo_returns_false_on_api_error(self, monkeypatch):
        monkeypatch.setattr(email_service, "EMAIL_PROVIDER", "brevo")
        monkeypatch.setenv("BREVO_API_KEY", "brevo_test_key")
        monkeypatch.setenv("BREVO_SENDER_EMAIL", "sender@example.com")

        fake_response = SimpleNamespace(status_code=400, text="bad request")

        with patch("httpx.post", return_value=fake_response):
            sent = email_service.send_password_reset_email("student@trentu.ca", "654321")

        assert sent is False
