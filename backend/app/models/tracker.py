import enum
import uuid

from sqlalchemy import String, Boolean, Integer, Float, DateTime, ForeignKey, Enum, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TrackerType(str, enum.Enum):
    NUMERIC = "NUMERIC"
    DUAL_NUMERIC = "DUAL_NUMERIC"
    BOOLEAN = "BOOLEAN"
    DURATION = "DURATION"
    TIME = "TIME"
    TEXT = "TEXT"


class DefaultBehavior(str, enum.Enum):
    CARRY_FORWARD = "CARRY_FORWARD"
    ZERO = "ZERO"
    NULL = "NULL"


class Tracker(Base):
    __tablename__ = "trackers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(64))
    color: Mapped[str | None] = mapped_column(String(7))  # hex color
    type: Mapped[TrackerType] = mapped_column(Enum(TrackerType), nullable=False)
    unit: Mapped[str | None] = mapped_column(String(32))
    unit_secondary: Mapped[str | None] = mapped_column(String(32))
    default_behavior: Mapped[DefaultBehavior] = mapped_column(Enum(DefaultBehavior), default=DefaultBehavior.NULL)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    archived: Mapped[bool] = mapped_column(Boolean, default=False)
    reminder_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    min_value: Mapped[float | None] = mapped_column(Float)
    max_value: Mapped[float | None] = mapped_column(Float)
    streak_goal: Mapped[int | None] = mapped_column(Integer)
    target_value: Mapped[float | None] = mapped_column(Float)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    deleted_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="trackers")
    entries = relationship("Entry", back_populates="tracker")
    alerts = relationship("TrackerAlert", back_populates="tracker", cascade="all, delete-orphan")
