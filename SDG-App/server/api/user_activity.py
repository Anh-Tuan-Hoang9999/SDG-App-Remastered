from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, Optional

import schemas
from db.database import get_db
from auth import get_current_user
from models.user import User
from models.user_activity import UserActivity
from models.activity import Activity

router = APIRouter(
    prefix="/user-activity",
    tags=["user-activity"],
)

DbDependency = Annotated[Session, Depends(get_db)]
UserDependency = Annotated[User, Depends(get_current_user)]


@router.post(
    "/start", response_model=schemas.UserActivityOut, status_code=status.HTTP_200_OK
)
async def start_or_resume_activity(
    body: schemas.UserActivityCreate,
    db: DbDependency,
    current_user: UserDependency,
):
    """
    Start a new activity attempt or resume an existing in-progress one.

    If the user already has an in-progress attempt for this activity it is
    returned (with all saved answers) so the UI can restore their progress.
    A new record is created when no in-progress attempt exists (either first
    attempt ever, or all previous attempts have been completed).
    """
    existing = (
        db.query(UserActivity)
        .filter(
            UserActivity.activity_id == body.activity_id,
            UserActivity.user_id == current_user.id,
            UserActivity.activity_status == "in_progress",
        )
        .first()
    )
    if existing:
        return existing

    activity = (
        db.query(Activity).filter(Activity.activity_id == body.activity_id).first()
    )
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found",
        )

    new_attempt = UserActivity(
        activity_id=body.activity_id,
        user_id=current_user.id,
        activity_status="in_progress",
        user_activity_data={},
    )
    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)
    return new_attempt


@router.patch("/{user_activity_id}", response_model=schemas.UserActivityOut)
async def save_activity_progress(
    user_activity_id: int,
    body: schemas.UserActivitySave,
    db: DbDependency,
    current_user: UserDependency,
):
    """
    Auto-save the user's current answers for an in-progress activity.

    Called on every answer selection so that navigating away never loses progress.
    The payload shape is flexible (stored as JSON) so it works for any activity
    type. For a multiple-choice quiz the expected shape is:
        {
            "answers": { "<questionId>": <selectedChoiceId>, ... },
            "currentQuestionIndex": 2,
            "shuffledQuestionIds": [3, 1, 4, 2, 5]
        }
    """
    record = (
        db.query(UserActivity)
        .filter(
            UserActivity.user_activity_id == user_activity_id,
            UserActivity.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User activity not found",
        )
    if record.activity_status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a completed activity",
        )

    record.user_activity_data = body.user_activity_data
    db.commit()
    db.refresh(record)
    return record


@router.patch("/{user_activity_id}/complete", response_model=schemas.UserActivityOut)
async def complete_activity(
    user_activity_id: int,
    body: schemas.UserActivityComplete,
    db: DbDependency,
    current_user: UserDependency,
):
    """
    Mark an activity as completed, record the final grade, and increment attempts.

    The grade should be formatted as a percentage string, e.g. "80%".
    """
    record = (
        db.query(UserActivity)
        .filter(
            UserActivity.user_activity_id == user_activity_id,
            UserActivity.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User activity not found",
        )

    record.activity_status = "completed"
    record.grade = body.grade
    record.user_activity_data = body.user_activity_data
    db.commit()
    db.refresh(record)
    return record


@router.get("/activity/{activity_id}", response_model=Optional[schemas.UserActivityOut])
async def get_activity_progress(
    activity_id: int,
    db: DbDependency,
    current_user: UserDependency,
):
    """
    Get the current user's most recent attempt for a given activity.

    Returns null (HTTP 200 with null body) if the user has no attempts yet.
    """
    record = (
        db.query(UserActivity)
        .filter(
            UserActivity.activity_id == activity_id,
            UserActivity.user_id == current_user.id,
        )
        .order_by(UserActivity.updated_at.desc())
        .first()
    )
    if record is None:
        return None

    # If the user has ever achieved 100% on this activity, surface that as
    # the displayed grade so the trophy/badge still shows — but the DB record
    # stores the real score for every attempt.
    has_perfect = (
        db.query(UserActivity)
        .filter(
            UserActivity.activity_id == activity_id,
            UserActivity.user_id == current_user.id,
            UserActivity.activity_status == "completed",
            UserActivity.grade == "100%",
        )
        .first()
    ) is not None

    if has_perfect and record.grade is not None:
        out = schemas.UserActivityOut.model_validate(record)
        out.grade = "100%"
        return out

    return record
