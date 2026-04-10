from db.database import Base
from sqlalchemy import Column, Integer, ForeignKey, Boolean, Text, String
from sqlalchemy.orm import relationship


class UserProgress(Base):
    __tablename__ = "user_progress"

    id                  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id             = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    viewed_sdg_cards    = Column(Text, nullable=True)    # JSON array of SDG numbers viewed
    completed_card_sort = Column(Boolean, default=False, nullable=False)
    completed_quiz      = Column(Boolean, default=False, nullable=False)
    reflection_count    = Column(Integer, default=0, nullable=False)
    viewed_resources    = Column(Text, nullable=True)    # JSON array of resource IDs viewed
    last_reset_date     = Column(String(10), nullable=True)  # YYYY-MM-DD

    user = relationship("User", back_populates="progress")
