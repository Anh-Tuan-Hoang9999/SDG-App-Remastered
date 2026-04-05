from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import schemas
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from db.database import get_db
from models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

DbDep      = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(body: schemas.RegisterIn, db: DbDep):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if body.role not in ("student", "coordinator"):
        raise HTTPException(status_code=400, detail="Role must be 'student' or 'coordinator'")
    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


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
