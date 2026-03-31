from db.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role          = Column(String(20), nullable=False, default="student")  # student | coordinator
    created_at    = Column(DateTime, server_default=func.current_timestamp())

    quiz_results       = relationship("QuizResult",       back_populates="user")
    card_sort_results  = relationship("CardSortResult",   back_populates="user")
    reflections        = relationship("Reflection",        back_populates="user")
    progress           = relationship("UserProgress",      back_populates="user", uselist=False)
    discussion_posts   = relationship("DiscussionPost",    back_populates="user")
    discussion_comments = relationship("DiscussionComment", back_populates="user")
