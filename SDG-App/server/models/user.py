from db.database import Base
from sqlalchemy import Boolean, Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum


# Enumerated Type for user account permission type
class UserRole(PyEnum):
    STUDENT = "Student"
    COORDINATOR = "Coordinator"
    ADMIN = "Admin"  # University Staff / Operations
    DEVELOPER = "Developer"  # System Owners / Technical Maintenance


# Database model for user class
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    course_code = Column(String(50), nullable=True)
    description = Column(String(255), nullable=True, default=None)

    # Account type, column confirms the permissions granted to a user
    user_type = Column(
        Enum(UserRole),
        default=UserRole.STUDENT,
        nullable=False,
    )
    # ! Relationship to courses - many-to-many (Omit this table for time being until main features are implemented)
    # courses = relationship("Course", secondary="user_courses", back_populates="users")
    is_active = Column(
        Boolean,
        default=True,  # ! is the account active and has NO bans/suspensions (default to TRUE)
    )
    is_verified = Column(
        Boolean,
        default=False,  # * acts as a whitelist attribute for instructors (default to FALSE)
    )
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(
        DateTime,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    user_activities = relationship("UserActivity", back_populates="user")
    posts = relationship("DiscussionPost", back_populates="user")
