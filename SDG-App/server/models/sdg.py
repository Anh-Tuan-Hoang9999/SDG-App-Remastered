from db.database import Base
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship


class SDG(Base):
    __tablename__ = "sdgs"

    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)
    number      = Column(Integer, unique=True, nullable=False)  # 1-17
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    icon        = Column(String(255), nullable=True)
    color       = Column(String(50), nullable=True)
    example     = Column(Text, nullable=True)

    quiz_questions = relationship("QuizQuestion", back_populates="sdg")
