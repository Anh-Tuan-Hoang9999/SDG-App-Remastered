from db.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class DiscussionPost(Base):
    __tablename__ = "discussion_posts"

    message_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    board_id = Column(Integer, ForeignKey("discussion_boards.board_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text_heading = Column(String(255), nullable=False)
    text_body = Column(String(5000), nullable=False)
    parent = Column(Integer, ForeignKey("discussion_posts.message_id"), nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    is_deleted = Column(Boolean, default=False)

    discussion_board = relationship("DiscussionBoard", back_populates="posts")
    user = relationship("User", back_populates="posts")
    parent_post = relationship(
        "DiscussionPost", remote_side=[message_id], back_populates="child_posts"
    )
    child_posts = relationship("DiscussionPost", back_populates="parent_post")
