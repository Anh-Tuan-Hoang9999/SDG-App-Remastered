from db.database import Base
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    JSON,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    table_name = Column(String(255), nullable=False)
    record_id = Column(Integer, nullable=False)
    action_type = Column(String(50), nullable=False)  # 'INSERT', 'UPDATE', 'DELETE'
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())

    __table_args__ = (
        CheckConstraint(
            "action_type IN ('INSERT', 'UPDATE', 'DELETE')", name="check_action_type"
        ),
    )

    user = relationship("User")
