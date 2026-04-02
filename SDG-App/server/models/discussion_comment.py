from db.database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class DiscussionComment(Base):
    __tablename__ = "discussion_comments"

    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id     = Column(Integer, ForeignKey("discussion_posts.id"), nullable=False)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String(100), nullable=False)
    body        = Column(Text, nullable=False)
    created_at  = Column(DateTime, server_default=func.current_timestamp())

    post = relationship("DiscussionPost", back_populates="comments")
    user = relationship("User", back_populates="discussion_comments")
