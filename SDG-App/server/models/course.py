from db.database import Base
from sqlalchemy import Column, Integer, String, CheckConstraint

class Course(Base):
    __tablename__ = "courses"
    
    course_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_identifier = Column(String(50), unique=True, nullable=False)
    course_name = Column(String(255), nullable=False)
    term = Column(String(50), nullable=False)
    calendar_year = Column(Integer, nullable=False)
    credits = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint("calendar_year >= 1900", name='check_calendar_year'),
    )