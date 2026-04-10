import os
import random
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

import schemas
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    hash_password,
    pwd_context,
    verify_password,
)
from db.database import get_db
from email_service import send_password_reset_email, send_verification_email
from models.email_verification import EmailVerification
from models.password_reset_code import PasswordResetCode
from models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

DbDep       = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CODE_EXPIRY_MINUTES = 10
RESEND_COOLDOWN_SECONDS = 60
# Set SKIP_EMAIL_VERIFICATION=true in the test environment to bypass the check
# so existing tests don't need to seed verification records.
_ALLOWED_DOMAIN = "@trentu.ca"


def _skip_verification() -> bool:
    return os.getenv("SKIP_EMAIL_VERIFICATION", "false").lower() == "true"


def _generate_code() -> str:
    return "".join(random.choices(string.digits, k=6))


def _generate_reset_token() -> str:
    return secrets.token_urlsafe(24)


# ---------------------------------------------------------------------------
# Verification endpoints
# ---------------------------------------------------------------------------

@router.post("/send-verification-code", status_code=status.HTTP_201_CREATED)
def send_verification_code(body: schemas.SendCodeIn, db: DbDep):
    email = body.email.lower()

    if not email.endswith(_ALLOWED_DOMAIN):
        raise HTTPException(
            status_code=400,
            detail=f"Only {_ALLOWED_DOMAIN} email addresses are allowed.",
        )

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Rate-limit: block rapid resends
    recent = (
        db.query(EmailVerification)
        .filter(EmailVerification.email == email, EmailVerification.used == False)
        .order_by(EmailVerification.created_at.desc())
        .first()
    )
    if recent:
        elapsed = (
            datetime.now(timezone.utc) - recent.created_at.replace(tzinfo=timezone.utc)
        ).total_seconds()
        if elapsed < RESEND_COOLDOWN_SECONDS:
            wait = int(RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {wait} seconds before requesting a new code.",
            )
        # Invalidate old records so only one active code exists per email
        db.query(EmailVerification).filter(
            EmailVerification.email == email,
            EmailVerification.used == False,
        ).delete()

    code = _generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=CODE_EXPIRY_MINUTES)
    record = EmailVerification(
        email=email,
        code_hash=pwd_context.hash(code),
        expires_at=expires_at,
    )
    db.add(record)
    db.commit()

    sent = send_verification_email(email, code)
    if not sent:
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=503,
            detail="Verification email could not be sent. Email delivery is not configured correctly.",
        )

    return {"message": "Verification code sent. Check your inbox."}


@router.post("/verify-code")
def verify_code(body: schemas.VerifyCodeIn, db: DbDep):
    email = body.email.lower()

    record = (
        db.query(EmailVerification)
        .filter(
            EmailVerification.email == email,
            EmailVerification.verified == False,
            EmailVerification.used == False,
        )
        .order_by(EmailVerification.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(status_code=400, detail="No pending verification found. Please request a new code.")

    if datetime.now(timezone.utc) > record.expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")

    if not pwd_context.verify(body.code, record.code_hash):
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    record.verified = True
    db.commit()
    return {"verified": True}


@router.post("/request-password-reset", status_code=status.HTTP_201_CREATED)
def request_password_reset(body: schemas.PasswordResetRequestIn, db: DbDep):
    email = body.email.lower()

    if not email.endswith(_ALLOWED_DOMAIN):
        raise HTTPException(
            status_code=400,
            detail=f"Only {_ALLOWED_DOMAIN} email addresses are allowed.",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {
            "message": "If an account exists for that email, a password reset code has been sent."
        }

    recent = (
        db.query(PasswordResetCode)
        .filter(PasswordResetCode.email == email, PasswordResetCode.used == False)
        .order_by(PasswordResetCode.created_at.desc())
        .first()
    )
    if recent:
        elapsed = (
            datetime.now(timezone.utc) - recent.created_at.replace(tzinfo=timezone.utc)
        ).total_seconds()
        if elapsed < RESEND_COOLDOWN_SECONDS:
            wait = int(RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {wait} seconds before requesting a new code.",
            )
        db.query(PasswordResetCode).filter(
            PasswordResetCode.email == email,
            PasswordResetCode.used == False,
        ).delete()

    code = _generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=CODE_EXPIRY_MINUTES)
    record = PasswordResetCode(
        email=email,
        code_hash=pwd_context.hash(code),
        expires_at=expires_at,
    )
    db.add(record)
    db.commit()

    sent = send_password_reset_email(email, code)
    if not sent:
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=503,
            detail="Password reset email could not be sent. Email delivery is not configured correctly.",
        )

    return {
        "message": "If an account exists for that email, a password reset code has been sent."
    }


@router.post("/verify-password-reset-code")
def verify_password_reset_code(body: schemas.PasswordResetVerifyIn, db: DbDep):
    email = body.email.lower()

    if not email.endswith(_ALLOWED_DOMAIN):
        raise HTTPException(
            status_code=400,
            detail=f"Only {_ALLOWED_DOMAIN} email addresses are allowed.",
        )

    record = (
        db.query(PasswordResetCode)
        .filter(
            PasswordResetCode.email == email,
            PasswordResetCode.verified == False,
            PasswordResetCode.used == False,
        )
        .order_by(PasswordResetCode.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(status_code=400, detail="No pending password reset found. Please request a new code.")

    if datetime.now(timezone.utc) > record.expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="Password reset code has expired. Please request a new code.")

    if not pwd_context.verify(body.code, record.code_hash):
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    reset_token = _generate_reset_token()
    record.verified = True
    record.reset_token_hash = pwd_context.hash(reset_token)
    record.expires_at = datetime.now(timezone.utc) + timedelta(minutes=CODE_EXPIRY_MINUTES)
    db.commit()
    return {"verified": True, "reset_token": reset_token}


@router.post("/reset-password")
def reset_password(body: schemas.PasswordResetConfirmIn, db: DbDep):
    email = body.email.lower()

    if not email.endswith(_ALLOWED_DOMAIN):
        raise HTTPException(
            status_code=400,
            detail=f"Only {_ALLOWED_DOMAIN} email addresses are allowed.",
        )

    record = (
        db.query(PasswordResetCode)
        .filter(
            PasswordResetCode.email == email,
            PasswordResetCode.verified == True,
            PasswordResetCode.used == False,
        )
        .order_by(PasswordResetCode.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=400,
            detail="Password reset session not found. Please request a new code.",
        )

    if datetime.now(timezone.utc) > record.expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Password reset session has expired. Please request a new code.",
        )

    if not record.reset_token_hash or not pwd_context.verify(body.reset_token, record.reset_token_hash):
        raise HTTPException(status_code=400, detail="Invalid password reset session.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="No account found for that email.")

    user.password_hash = hash_password(body.new_password)
    record.used = True
    db.commit()
    return {"message": "Password updated successfully."}


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(
    body: schemas.RegisterIn,
    db: DbDep,
    x_bypass_verification: str | None = Header(default=None, alias="X-Bypass-Verification"),
):
    email = body.email.lower()

    if not email.endswith(_ALLOWED_DOMAIN):
        raise HTTPException(
            status_code=400,
            detail=f"Only {_ALLOWED_DOMAIN} email addresses are allowed.",
        )

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if body.role not in ("student", "coordinator"):
        raise HTTPException(status_code=400, detail="Role must be 'student' or 'coordinator'")

    bypass_enabled = (x_bypass_verification or "").lower() == "true"

    if not _skip_verification() and not bypass_enabled:
        verified_record = (
            db.query(EmailVerification)
            .filter(
                EmailVerification.email == email,
                EmailVerification.verified == True,
                EmailVerification.used == False,
            )
            .order_by(EmailVerification.created_at.desc())
            .first()
        )
        if not verified_record:
            raise HTTPException(
                status_code=400,
                detail="Email not verified. Please complete the verification step.",
            )
        verified_record.used = True
        db.add(verified_record)

    user = User(
        name=body.name,
        email=email,
        password_hash=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Login / logout / me
# ---------------------------------------------------------------------------

@router.post("/login", response_model=schemas.Token)
def login(body: schemas.LoginIn, db: DbDep):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(
        {"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
def logout():
    # JWT is stateless — client drops the token
    return {"message": "Logged out"}


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=schemas.UserOut)
def update_me(body: schemas.UserUpdateIn, current_user: CurrentUser, db: DbDep):
    provided_fields = body.model_fields_set

    if "name" in provided_fields:
        current_user.name = body.name
    if "description" in provided_fields:
        current_user.description = body.description
    if "course_code" in provided_fields:
        current_user.course_code = body.course_code
    if "avatar_url" in provided_fields:
        current_user.avatar_url = body.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user
