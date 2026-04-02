from db.database import Base
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id           = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    score        = Column(Integer, nullable=False)
    total        = Column(Integer, nullable=False)
    answers_json = Column(Text, nullable=True)   # JSON string
    submitted_at = Column(DateTime, server_default=func.current_timestamp())

    user = relationship("User", back_populates="quiz_results")
