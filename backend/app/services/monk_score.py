"""Monk Score calculation — XP, levels, and 5 dimensions."""
import math
import uuid
from datetime import date, timedelta

from sqlalchemy import func as sqlfunc
from sqlalchemy.orm import Session

from app.models.monk_score import MonkScore
from app.models.tracker import Tracker
from app.models.entry import Entry


def calculate_xp_for_entry(difficulty: int, streak: int) -> int:
    """XP = base (10) × difficulty × streak multiplier."""
    base = 10
    streak_mult = 1 + min(streak, 30) * 0.05  # Max 2.5x at 30-day streak
    return int(base * difficulty * streak_mult)


def level_from_xp(xp: int) -> tuple[int, int]:
    """Returns (level, xp_to_next_level). Level = floor(sqrt(xp / 100))."""
    level = max(1, int(math.sqrt(xp / 100)))
    next_level_xp = ((level + 1) ** 2) * 100
    xp_to_next = next_level_xp - xp
    return level, max(0, xp_to_next)


def recalculate_monk_score(user_id: uuid.UUID, db: Session) -> MonkScore:
    """Recalculate the full Monk Score for a user."""
    score = db.query(MonkScore).filter(MonkScore.user_id == user_id).first()
    if not score:
        score = MonkScore(user_id=user_id)
        db.add(score)

    # Get all active trackers with their dimensions
    trackers = db.query(Tracker).filter(
        Tracker.user_id == user_id,
        Tracker.is_active == True,
    ).all()

    if not trackers:
        db.commit()
        db.refresh(score)
        return score

    # Calculate total XP from all entries
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)

    total_xp = 0
    dimension_scores = {"wisdom": 0, "strength": 0, "focus": 0, "discipline": 0, "confidence": 0}
    dimension_counts = {"wisdom": 0, "strength": 0, "focus": 0, "discipline": 0, "confidence": 0}

    for tracker in trackers:
        # Count entries in last 30 days
        entry_count = db.query(Entry).filter(
            Entry.tracker_id == tracker.id,
            Entry.is_active == True,
            Entry.date >= thirty_days_ago,
        ).count()

        # Calculate streak
        streak = 0
        check_date = today
        while True:
            has_entry = db.query(Entry).filter(
                Entry.tracker_id == tracker.id,
                Entry.date == check_date,
                Entry.is_active == True,
            ).first()
            if has_entry:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break

        # XP for each entry
        for _ in range(entry_count):
            total_xp += calculate_xp_for_entry(tracker.difficulty or 1, streak)

        # Dimension contribution
        dim = tracker.dimension or _auto_dimension(tracker.name)
        if dim in dimension_scores:
            # Score = completion rate × 100
            total_days = 30
            completion = min(100, (entry_count / total_days) * 100)
            dimension_scores[dim] += completion
            dimension_counts[dim] += 1

    # Average dimensions
    for dim in dimension_scores:
        if dimension_counts[dim] > 0:
            dimension_scores[dim] = round(dimension_scores[dim] / dimension_counts[dim], 1)

    level, xp_to_next = level_from_xp(total_xp)

    score.xp_total = total_xp
    score.level = level
    score.xp_to_next = xp_to_next
    score.wisdom = dimension_scores["wisdom"]
    score.strength = dimension_scores["strength"]
    score.focus = dimension_scores["focus"]
    score.discipline = dimension_scores["discipline"]
    score.confidence = dimension_scores["confidence"]
    score.overall = round(sum(dimension_scores.values()) / 5, 1)

    db.commit()
    db.refresh(score)
    return score


def _auto_dimension(name: str) -> str:
    """Auto-assign dimension based on tracker name."""
    name_lower = name.lower()
    if any(w in name_lower for w in ["read", "book", "page", "learn", "study"]):
        return "wisdom"
    if any(w in name_lower for w in ["gym", "workout", "run", "exercise", "push", "weight", "step"]):
        return "strength"
    if any(w in name_lower for w in ["deep work", "focus", "meditat", "pomodoro"]):
        return "focus"
    if any(w in name_lower for w in ["water", "sleep", "wake", "brush", "cold shower", "no "]):
        return "discipline"
    if any(w in name_lower for w in ["journal", "gratitude", "social", "mood", "groom"]):
        return "confidence"
    return "discipline"  # Default
