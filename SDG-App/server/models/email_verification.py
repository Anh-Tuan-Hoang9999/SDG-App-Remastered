from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func

from db.database import Base


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    email      = Column(String(255), nullable=False, index=True)
    code_hash  = Column(String(255), nullable=False)
    failed_attempts = Column(Integer, default=0, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    verified   = Column(Boolean, default=False, nullable=False)
    used       = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.current_timestamp())
