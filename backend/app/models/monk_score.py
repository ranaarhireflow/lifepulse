import uuid

from sqlalchemy import Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MonkScore(Base):
    __tablename__ = "monk_scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    level: Mapped[int] = mapped_column(Integer, default=1)
    xp_total: Mapped[int] = mapped_column(Integer, default=0)
    xp_to_next: Mapped[int] = mapped_column(Integer, default=125)

    # 5 Dimensions (0-100 scale)
    wisdom: Mapped[float] = mapped_column(Float, default=0)       # reading, learning
    strength: Mapped[float] = mapped_column(Float, default=0)     # exercise, physical
    focus: Mapped[float] = mapped_column(Float, default=0)        # deep work, meditation
    discipline: Mapped[float] = mapped_column(Float, default=0)   # consistency habits
    confidence: Mapped[float] = mapped_column(Float, default=0)   # social, personal care

    overall: Mapped[float] = mapped_column(Float, default=0)      # average of 5

    calculated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="monk_score")
