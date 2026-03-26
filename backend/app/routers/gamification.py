import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.achievement import Achievement, UserAchievement
from app.models.monk_score import MonkScore
from app.services.monk_score import recalculate_monk_score
from app.services.achievements import check_and_unlock

router = APIRouter()


class MonkScoreResponse(BaseModel):
    level: int
    xp_total: int
    xp_to_next: int
    overall: float
    wisdom: float
    strength: float
    focus: float
    discipline: float
    confidence: float

    model_config = {"from_attributes": True}


class AchievementResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    icon: str
    category: str
    is_secret: bool
    xp_reward: int
    unlocked: bool = False
    unlocked_at: str | None = None

    model_config = {"from_attributes": True}


@router.get("/score", response_model=MonkScoreResponse)
def get_monk_score(
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Get or recalculate Monk Score."""
    score = recalculate_monk_score(user.id, db)
    return score


@router.get("/achievements", response_model=list[AchievementResponse])
def get_achievements(
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Get all achievements with unlock status."""
    all_achievements = db.query(Achievement).order_by(Achievement.sort_order).all()
    unlocked = {
        ua.achievement_id: ua.unlocked_at
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
    }

    result = []
    for ach in all_achievements:
        is_unlocked = ach.id in unlocked
        result.append(AchievementResponse(
            id=ach.id,
            name=ach.name if is_unlocked or not ach.is_secret else "???",
            description=ach.description if is_unlocked or not ach.is_secret else "Hidden achievement",
            icon=ach.icon if is_unlocked else "❓",
            category=ach.category,
            is_secret=ach.is_secret,
            xp_reward=ach.xp_reward,
            unlocked=is_unlocked,
            unlocked_at=str(unlocked[ach.id]) if is_unlocked else None,
        ))

    return result


@router.post("/check-achievements")
def trigger_achievement_check(
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Manually trigger achievement check. Returns newly unlocked."""
    newly = check_and_unlock(user.id, db)
    return {
        "newly_unlocked": [
            {"name": a.name, "icon": a.icon, "description": a.description, "xp": a.xp_reward}
            for a in newly
        ]
    }
