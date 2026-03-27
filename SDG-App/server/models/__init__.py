# Import all models so SQLAlchemy Base.metadata is fully populated
from .user import User
from .course import Course
from .sdg_card import SDGCard
from .activity import Activity
from .user_activity import UserActivity
from .discussion_board import DiscussionBoard
from .discussion_post import DiscussionPost
from .audit_log import AuditLog
