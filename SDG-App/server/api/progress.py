import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
from db.database import get_db
from models.user_progress import UserProgress

router = APIRouter(prefix="/api/progress", tags=["progress"])

DbDep = Annotated[Session, Depends(get_db)]


def _parse(row: UserProgress) -> dict:
    return {
        "id":                  row.id,
        "user_id":             row.user_id,
        "viewed_sdg_cards":    json.loads(row.viewed_sdg_cards)  if row.viewed_sdg_cards  else None,
        "completed_card_sort": row.completed_card_sort,
        "completed_quiz":      row.completed_quiz,
        "reflection_count":    row.reflection_count,
        "viewed_resources":    json.loads(row.viewed_resources)  if row.viewed_resources   else None,
    }


def _get_or_create(user_id: int, db: Session) -> UserProgress:
    row = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not row:
        row = UserProgress(user_id=user_id)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("/{user_id}", response_model=schemas.ProgressOut)
def get_progress(user_id: int, db: DbDep):
    return _parse(_get_or_create(user_id, db))


@router.patch("/{user_id}", response_model=schemas.ProgressOut)
def update_progress(user_id: int, body: schemas.ProgressPatchIn, db: DbDep):
    row = _get_or_create(user_id, db)
    if body.viewed_sdg_cards is not None:
        row.viewed_sdg_cards = json.dumps(body.viewed_sdg_cards)
    if body.completed_card_sort is not None:
        row.completed_card_sort = body.completed_card_sort
    if body.completed_quiz is not None:
        row.completed_quiz = body.completed_quiz
    if body.reflection_count is not None:
        row.reflection_count = body.reflection_count
    if body.viewed_resources is not None:
        row.viewed_resources = json.dumps(body.viewed_resources)
    db.commit()
    db.refresh(row)
    return _parse(row)
