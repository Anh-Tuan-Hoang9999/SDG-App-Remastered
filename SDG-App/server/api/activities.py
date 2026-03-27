from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, List

import schemas
from db.database import get_db
from auth import get_current_user
from models.user import User, UserRole
from models.activity import Activity

router = APIRouter(
    prefix="/activities",
    tags=["activities"],
)

DbDependency = Annotated[Session, Depends(get_db)]
UserDependency = Annotated[User, Depends(get_current_user)]


@router.post(
    "/", response_model=schemas.ActivityOut, status_code=status.HTTP_201_CREATED
)
async def create_activity(
    activity_data: schemas.ActivityCreate,
    db: DbDependency,
    current_user: UserDependency,
):
    # Authorization check
    if current_user.user_type not in [
        UserRole.ADMIN,
        UserRole.COORDINATOR,
        UserRole.DEVELOPER,
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create activities",
        )

    # activity_content is automatically a dict because of how Pydantic handles JSON columns
    new_activity = Activity(
        sdg_card_id=activity_data.sdg_card_id,
        activity_type=activity_data.activity_type,
        activity_content=activity_data.activity_content.model_dump(),
        activity_stats=activity_data.activity_stats,
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    return new_activity


@router.get("/sdg/{sdg_card_id}", response_model=List[schemas.ActivityOut])
async def get_activities_by_sdg(
    sdg_card_id: int,
    db: DbDependency,
    current_user: UserDependency,
):
    # Authorization check
    if current_user.user_type not in [
        UserRole.ADMIN,
        UserRole.COORDINATOR,
        UserRole.DEVELOPER,
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view activities for this SDG",
        )
    return db.query(Activity).filter(Activity.sdg_card_id == sdg_card_id).all()


@router.get("/sdg/{sdg_card_id}/{position}", response_model=schemas.ActivityOut)
async def get_activity_by_sdg_and_position(
    sdg_card_id: int, position: int, db: DbDependency
):
    """
    Return the Nth activity (1-based) belonging to the given SDG card,
    ordered by activity_id. This matches how the frontend numbers buttons
    within an SDG's activity list.
    """
    activities = (
        db.query(Activity)
        .filter(Activity.sdg_card_id == sdg_card_id)
        .order_by(Activity.activity_id)
        .all()
    )
    if position < 1 or position > len(activities):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity {position} not found for SDG {sdg_card_id}",
        )
    return activities[position - 1]


@router.get("/{activity_id}", response_model=schemas.ActivityOut)
async def get_activity(activity_id: int, db: DbDependency):
    activity = db.query(Activity).filter(Activity.activity_id == activity_id).first()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found",
        )
    return activity
