from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from db.database import Base


class PasswordResetCode(Base):
    __tablename__ = "password_reset_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, index=True)
    code_hash = Column(String(255), nullable=False)
    reset_token_hash = Column(String(255), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    verified = Column(Boolean, default=False, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.current_timestamp())
