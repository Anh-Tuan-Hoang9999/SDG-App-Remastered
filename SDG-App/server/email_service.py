"""
Email service abstraction for sending verification codes.

Supported providers (set via EMAIL_PROVIDER env var):
  resend  — Resend API (set RESEND_API_KEY and optionally RESEND_FROM_EMAIL)
  smtp    — SMTP relay (set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)
  none    — console / log only (default; useful for local dev and tests)

If EMAIL_PROVIDER is set to "none" (the default), the service logs the code
to the console for local development.

If a real provider is selected but required credentials are missing, the
service returns False so the API can surface an actual configuration error
instead of pretending the email was sent.
"""
import logging
import os
import smtplib
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "none").lower()


def send_verification_email(to_email: str, code: str) -> bool:
    """Send a 6-digit verification code to *to_email*. Returns True on success."""
    subject = "Your SDG Co-op Portal verification code"
    body = (
        f"Your verification code is: {code}\n\n"
        "This code expires in 10 minutes.\n"
        "If you did not request this, you can safely ignore this email."
    )

    if EMAIL_PROVIDER == "resend":
        return _send_via_resend(to_email, subject, body)
    if EMAIL_PROVIDER == "smtp":
        return _send_via_smtp(to_email, subject, body)
    # Default: console / no-op — log the code so dev/test can proceed
    return _console_log(to_email, code)


# ---------------------------------------------------------------------------
# Provider implementations
# ---------------------------------------------------------------------------

def _console_log(to_email: str, code: str) -> bool:
    print(f"\n[DEV EMAIL] To: {to_email}  |  Verification code: {code}\n", flush=True)
    logger.info("DEV email — To: %s  Code: %s", to_email, code)
    return True


def _send_via_resend(to_email: str, subject: str, body: str) -> bool:
    api_key = os.getenv("RESEND_API_KEY", "")
    from_email = os.getenv("RESEND_FROM_EMAIL", "noreply@trentu.ca")
    if not api_key:
        logger.error("RESEND_API_KEY not set — cannot send email via Resend")
        return False
    try:
        import httpx  # httpx is already a project dependency (used by test client)
        r = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={"from": from_email, "to": [to_email], "subject": subject, "text": body},
            timeout=10,
        )
        if r.status_code not in (200, 201):
            logger.error("Resend returned %s: %s", r.status_code, r.text)
            return False
        return True
    except Exception as exc:
        logger.error("Resend error: %s", exc)
        return False


def _send_via_smtp(to_email: str, subject: str, body: str) -> bool:
    host = os.getenv("SMTP_HOST", "")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER", "")
    password = os.getenv("SMTP_PASS", "")
    from_email = os.getenv("SMTP_FROM", user)
    if not host or not user or not password:
        logger.error("SMTP not fully configured — cannot send email via SMTP")
        return False
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        with smtplib.SMTP(host, port) as server:
            server.starttls()
            server.login(user, password)
            server.sendmail(from_email, [to_email], msg.as_string())
        return True
    except Exception as exc:
        logger.error("SMTP error: %s", exc)
        return False
