from db.database import Base
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    JSON,
    DateTime,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class UserActivity(Base):
    __tablename__ = "user_activity"

    user_activity_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    activity_id = Column(
        Integer, ForeignKey("activities.activity_id"), nullable=False, index=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    activity_status = Column(String(50), nullable=False)
    grade = Column(String(50), nullable=True)
    user_activity_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(
        DateTime,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    __table_args__ = (
        CheckConstraint(
            "activity_status IN ('not_started', 'in_progress', 'completed')",
            name="check_activity_status",
        ),
    )

    activity = relationship("Activity", back_populates="user_activities")
    user = relationship("User", back_populates="user_activities")
