import json
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
from db.database import get_db
from models.quiz_question import QuizQuestion
from models.quiz_result import QuizResult

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

DbDep = Annotated[Session, Depends(get_db)]


@router.get("/questions", response_model=List[schemas.QuizQuestionOut])
def get_questions(db: DbDep):
    return db.query(QuizQuestion).all()


@router.post("/submit", response_model=schemas.QuizResultOut, status_code=201)
def submit_quiz(body: schemas.QuizSubmitIn, db: DbDep):
    result = QuizResult(
        user_id=body.user_id,
        score=body.score,
        total=body.total,
        answers_json=json.dumps(body.answers_json) if body.answers_json is not None else None,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    # Parse answers_json back to object for the response
    result.answers_json = json.loads(result.answers_json) if result.answers_json else None
    return result


@router.get("/result/{user_id}", response_model=schemas.QuizResultOut)
def get_latest_result(user_id: int, db: DbDep):
    result = (
        db.query(QuizResult)
        .filter(QuizResult.user_id == user_id)
        .order_by(QuizResult.id.desc())
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="No quiz result found for this user")
    result.answers_json = json.loads(result.answers_json) if result.answers_json else None
    return result
