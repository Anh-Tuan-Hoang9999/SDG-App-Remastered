from db.database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id             = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sdg_number     = Column(Integer, ForeignKey("sdgs.number"), nullable=False)
    question_text  = Column(Text, nullable=False)
    option_a       = Column(String(500), nullable=False)
    option_b       = Column(String(500), nullable=False)
    option_c       = Column(String(500), nullable=False)
    option_d       = Column(String(500), nullable=False)
    correct_option = Column(String(1), nullable=False)  # 'a' | 'b' | 'c' | 'd'
    explanation    = Column(Text, nullable=True)
    fun_facts      = Column(Text, nullable=True)

    sdg = relationship("SDG", back_populates="quiz_questions")
