from typing import Annotated, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import schemas
from db.database import get_db
from models.sdg import SDG

router = APIRouter(prefix="/api/sdgs", tags=["sdgs"])

DbDep = Annotated[Session, Depends(get_db)]


@router.get("", response_model=List[schemas.SDGOut])
def get_all_sdgs(db: DbDep):
    return db.query(SDG).order_by(SDG.number).all()
