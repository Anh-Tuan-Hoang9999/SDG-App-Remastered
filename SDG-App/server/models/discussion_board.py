from db.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class DiscussionBoard(Base):
    __tablename__ = "discussion_boards"
    
    board_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    heading = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)

    posts = relationship("DiscussionPost", back_populates="discussion_board")