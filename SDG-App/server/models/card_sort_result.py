from db.database import Base
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class CardSortResult(Base):
    __tablename__ = "card_sort_results"

    id                = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id           = Column(Integer, ForeignKey("users.id"), nullable=False)
    most_relevant     = Column(Text, nullable=True)      # JSON array of SDG numbers
    somewhat_relevant = Column(Text, nullable=True)      # JSON array of SDG numbers
    least_relevant    = Column(Text, nullable=True)      # JSON array of SDG numbers
    saved_at          = Column(DateTime, server_default=func.current_timestamp())

    user = relationship("User", back_populates="card_sort_results")
