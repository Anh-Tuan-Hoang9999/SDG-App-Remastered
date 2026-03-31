import json
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
from db.database import get_db
from models.reflection import Reflection

router = APIRouter(prefix="/api/reflections", tags=["reflections"])

DbDep = Annotated[Session, Depends(get_db)]


def _parse(row: Reflection) -> dict:
    return {
        "id":                  row.id,
        "user_id":             row.user_id,
        "title":               row.title,
        "type":                row.reflection_type,
        "sdg_numbers":         json.loads(row.sdg_numbers) if row.sdg_numbers else None,
        "reflection_text":     row.reflection_text,
        "employer_discussion": row.employer_discussion,
        "created_at":          row.created_at,
    }


@router.get("/{user_id}", response_model=List[schemas.ReflectionOut])
def list_reflections(user_id: int, db: DbDep):
    rows = (
        db.query(Reflection)
        .filter(Reflection.user_id == user_id)
        .order_by(Reflection.created_at.desc())
        .all()
    )
    return [_parse(r) for r in rows]


@router.post("", response_model=schemas.ReflectionOut, status_code=201)
def create_reflection(body: schemas.ReflectionIn, db: DbDep):
    row = Reflection(
        user_id=body.user_id,
        title=body.title,
        reflection_type=body.type,
        sdg_numbers=json.dumps(body.sdg_numbers) if body.sdg_numbers is not None else None,
        reflection_text=body.reflection_text,
        employer_discussion=body.employer_discussion,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _parse(row)


@router.delete("/{reflection_id}", status_code=204)
def delete_reflection(reflection_id: int, db: DbDep):
    row = db.query(Reflection).filter(Reflection.id == reflection_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Reflection not found")
    db.delete(row)
    db.commit()
