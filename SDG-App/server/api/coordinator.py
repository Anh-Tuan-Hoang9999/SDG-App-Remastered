import json
from typing import Annotated, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import schemas
from auth import require_coordinator
from db.database import get_db
from models.reflection import Reflection
from models.user import User
from models.user_progress import UserProgress

router = APIRouter(prefix="/api/coordinator", tags=["coordinator"])

DbDep = Annotated[Session, Depends(get_db)]


@router.get("/students", response_model=List[schemas.StudentSummaryOut])
def list_students(db: DbDep, _: User = Depends(require_coordinator)):
    students = db.query(User).filter(User.role == "student").all()
    result = []
    for s in students:
        prog = db.query(UserProgress).filter(UserProgress.user_id == s.id).first()
        result.append({
            "id":                  s.id,
            "name":                s.name,
            "email":               s.email,
            "role":                s.role,
            "completed_card_sort": prog.completed_card_sort if prog else None,
            "completed_quiz":      prog.completed_quiz      if prog else None,
            "reflection_count":    prog.reflection_count    if prog else None,
        })
    return result


@router.get("/reflections", response_model=List[schemas.ReflectionSummaryOut])
def list_all_reflections(db: DbDep, _: User = Depends(require_coordinator)):
    rows = db.query(Reflection).order_by(Reflection.created_at.desc()).all()
    return [
        {
            "id":                  r.id,
            "user_id":             r.user_id,
            "title":               r.title,
            "type":                r.reflection_type,
            "employer_discussion": r.employer_discussion,
            "created_at":          r.created_at,
        }
        for r in rows
    ]
