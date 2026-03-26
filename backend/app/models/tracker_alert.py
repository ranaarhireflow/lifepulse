import uuid

from sqlalchemy import String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer

from app.database import Base


class TrackerAlert(Base):
    __tablename__ = "tracker_alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tracker_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trackers.id", ondelete="CASCADE"), nullable=False)
    alert_time: Mapped[str] = mapped_column(String(5), nullable=False)  # "HH:MM"
    alert_days: Mapped[list[int]] = mapped_column(ARRAY(Integer), default=[1, 2, 3, 4, 5, 6, 7])  # ISO day of week
    label: Mapped[str | None] = mapped_column(String(128))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tracker = relationship("Tracker", back_populates="alerts")
