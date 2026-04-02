from db.database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class Reflection(Base):
    __tablename__ = "reflections"

    id                  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id             = Column(Integer, ForeignKey("users.id"), nullable=False)
    title               = Column(String(255), nullable=False)
    reflection_type     = Column("type", String(100), nullable=True)
    sdg_numbers         = Column(Text, nullable=True)       # JSON array of SDG numbers
    reflection_text     = Column(Text, nullable=False)
    employer_discussion = Column(Boolean, default=False, nullable=False)
    created_at          = Column(DateTime, server_default=func.current_timestamp())

    user = relationship("User", back_populates="reflections")
