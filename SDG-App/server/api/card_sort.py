import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
from db.database import get_db
from models.card_sort_result import CardSortResult

router = APIRouter(prefix="/api/card-sort", tags=["card-sort"])

DbDep = Annotated[Session, Depends(get_db)]


def _parse(row: CardSortResult) -> CardSortResult:
    """Deserialise JSON text fields in-place before returning."""
    row.most_relevant     = json.loads(row.most_relevant)     if row.most_relevant     else None
    row.somewhat_relevant = json.loads(row.somewhat_relevant) if row.somewhat_relevant else None
    row.least_relevant    = json.loads(row.least_relevant)    if row.least_relevant    else None
    return row


@router.get("/{user_id}", response_model=schemas.CardSortOut)
def get_card_sort(user_id: int, db: DbDep):
    row = (
        db.query(CardSortResult)
        .filter(CardSortResult.user_id == user_id)
        .order_by(CardSortResult.saved_at.desc())
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="No card sort result found for this user")
    return _parse(row)


@router.post("", response_model=schemas.CardSortOut, status_code=201)
def save_card_sort(body: schemas.CardSortIn, db: DbDep):
    # Upsert: replace existing record for the user
    existing = db.query(CardSortResult).filter(CardSortResult.user_id == body.user_id).first()
    if existing:
        existing.most_relevant     = json.dumps(body.most_relevant)     if body.most_relevant     is not None else None
        existing.somewhat_relevant = json.dumps(body.somewhat_relevant) if body.somewhat_relevant is not None else None
        existing.least_relevant    = json.dumps(body.least_relevant)    if body.least_relevant    is not None else None
        db.commit()
        db.refresh(existing)
        return _parse(existing)

    row = CardSortResult(
        user_id=body.user_id,
        most_relevant=json.dumps(body.most_relevant)         if body.most_relevant     is not None else None,
        somewhat_relevant=json.dumps(body.somewhat_relevant) if body.somewhat_relevant is not None else None,
        least_relevant=json.dumps(body.least_relevant)       if body.least_relevant    is not None else None,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _parse(row)
