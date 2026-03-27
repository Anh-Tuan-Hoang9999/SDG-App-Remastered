from db.database import Base
from sqlalchemy import Column, Integer, String, JSON, CheckConstraint, ForeignKey
from sqlalchemy.orm import relationship


# Classes for each activity type


class Activity(Base):
    __tablename__ = "activities"

    activity_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sdg_card_id = Column(Integer, ForeignKey("sdg_cards.card_id"), nullable=False)
    activity_type = Column(String(50), nullable=False)
    activity_content = Column(JSON, nullable=False)
    activity_stats = Column(JSON, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "activity_type IN ('quiz', 'matching', 'flashcard')",
            name="check_activity_type",
        ),
    )

    sdg_card = relationship("SDGCard", back_populates="activities")
    user_activities = relationship("UserActivity", back_populates="activity")
