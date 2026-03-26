import uuid

from sqlalchemy import String, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.tracker import TrackerType, DefaultBehavior


class TrackerTemplate(Base):
    __tablename__ = "tracker_templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(64))
    color: Mapped[str | None] = mapped_column(String(7))
    type: Mapped[TrackerType] = mapped_column(Enum(TrackerType), nullable=False)
    unit: Mapped[str | None] = mapped_column(String(32))
    unit_secondary: Mapped[str | None] = mapped_column(String(32))
    default_behavior: Mapped[DefaultBehavior] = mapped_column(Enum(DefaultBehavior), default=DefaultBehavior.NULL)
    category: Mapped[str | None] = mapped_column(String(64))
