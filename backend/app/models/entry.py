import uuid

from sqlalchemy import String, Boolean, Integer, Float, Date, DateTime, ForeignKey, Text, UniqueConstraint, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Entry(Base):
    __tablename__ = "entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tracker_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trackers.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[Date] = mapped_column(Date, nullable=False)

    # Typed value columns — only the relevant one is populated per tracker type
    value_numeric: Mapped[float | None] = mapped_column(Float)
    value_numeric2: Mapped[float | None] = mapped_column(Float)
    value_boolean: Mapped[bool | None] = mapped_column(Boolean)
    value_duration: Mapped[int | None] = mapped_column(Integer)  # minutes
    value_time: Mapped[str | None] = mapped_column(String(5))  # "HH:MM"
    value_text: Mapped[str | None] = mapped_column(Text)

    note: Mapped[str | None] = mapped_column(Text)
    logged_timezone: Mapped[str | None] = mapped_column(String(64))  # e.g. "Asia/Kolkata"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    deleted_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tracker = relationship("Tracker", back_populates="entries")
    user = relationship("User", back_populates="entries")

    __table_args__ = (
        UniqueConstraint("tracker_id", "date", name="uq_tracker_date"),
        Index("ix_user_date", "user_id", "date"),
        Index("ix_tracker_date", "tracker_id", "date"),
    )
