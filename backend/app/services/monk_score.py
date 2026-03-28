"""Monk Score calculation — XP, levels, and 5 dimensions."""
import math
import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func as sqlfunc
from sqlalchemy.orm import Session

from app.models.monk_score import MonkScore
from app.models.tracker import Tracker
from app.models.entry import Entry

# Cache: user_id -> (timestamp, MonkScore)
_score_cache: dict[uuid.UUID, tuple[float, MonkScore]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes


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


def calculate_and_update_score(user_id: uuid.UUID, db: Session) -> MonkScore:
    """Recalculate monk score from actual entry data."""
    # Get user's active trackers
    trackers = db.query(Tracker).filter(
        Tracker.user_id == user_id,
        Tracker.is_active == True,
    ).all()

    score = db.query(MonkScore).filter(MonkScore.user_id == user_id).first()
    if not score:
        score = MonkScore(user_id=user_id)
        db.add(score)

    if not trackers:
        db.commit()
        db.refresh(score)
        return score

    # Get entries from last 30 days
    today = date.today()
    since = today - timedelta(days=30)
    entries = db.query(Entry).filter(
        Entry.user_id == user_id,
        Entry.is_active == True,
        Entry.date >= since,
    ).all()

    # Calculate per-dimension scores
    dimension_scores: dict[str, float] = {
        "wisdom": 0, "strength": 0, "focus": 0, "discipline": 0, "confidence": 0,
    }
    dimension_counts: dict[str, int] = {
        "wisdom": 0, "strength": 0, "focus": 0, "discipline": 0, "confidence": 0,
    }
    total_xp = 0

    for tracker in trackers:
        dim = tracker.dimension or _auto_dimension(tracker.name)
        tracker_entries = [e for e in entries if e.tracker_id == tracker.id]

        # Base XP: 10 per logged entry
        entry_xp = len(tracker_entries) * 10

        # Bonus XP: 5 per entry that hits target
        if tracker.target_value:
            hits = sum(
                1 for e in tracker_entries
                if e.value_numeric is not None and e.value_numeric >= tracker.target_value
            )
            entry_xp += hits * 5

        # Streak bonus: current streak * 2 XP
        streak = 0
        for i in range(30):
            day = today - timedelta(days=i)
            if any(e.date == day for e in tracker_entries):
                streak += 1
            else:
                break
        entry_xp += streak * 2

        # Apply difficulty multiplier
        difficulty = tracker.difficulty or 1
        entry_xp = int(entry_xp * (1 + (difficulty - 1) * 0.2))

        total_xp += entry_xp

        # Dimension score: based on completion rate (0-100)
        if dim in dimension_scores:
            if len(tracker_entries) > 0:
                completion = min(len(tracker_entries) / 30 * 100, 100)
                dimension_scores[dim] += completion
                dimension_counts[dim] += 1

    # Average dimensions (where trackers exist)
    for dim in dimension_scores:
        if dimension_counts[dim] > 0:
            dimension_scores[dim] = round(
                dimension_scores[dim] / dimension_counts[dim], 1
            )

    # Discipline bonus for daily logging consistency
    unique_days = len(set(e.date for e in entries))
    dimension_scores["discipline"] = min(
        dimension_scores["discipline"] + unique_days * 2, 100
    )

    # Calculate level from XP (quadratic: level^2 * 100)
    level, xp_to_next = level_from_xp(total_xp)

    # Overall = average of dimensions
    overall = round(sum(dimension_scores.values()) / 5, 1)

    # Update score
    score.level = level
    score.xp_total = total_xp
    score.xp_to_next = xp_to_next
    score.wisdom = dimension_scores["wisdom"]
    score.strength = dimension_scores["strength"]
    score.focus = dimension_scores["focus"]
    score.discipline = dimension_scores["discipline"]
    score.confidence = dimension_scores["confidence"]
    score.overall = overall
    score.calculated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(score)

    # Update cache
    _score_cache[user_id] = (datetime.now(timezone.utc).timestamp(), score)

    return score


def recalculate_monk_score(user_id: uuid.UUID, db: Session) -> MonkScore:
    """Recalculate the full Monk Score for a user (with 5-minute cache)."""
    now = datetime.now(timezone.utc).timestamp()

    # Check cache
    if user_id in _score_cache:
        cached_at, cached_score = _score_cache[user_id]
        if now - cached_at < CACHE_TTL_SECONDS:
            # Merge the cached object back into the session if needed
            try:
                db.add(cached_score)
                db.refresh(cached_score)
                return cached_score
            except Exception:
                pass  # Fall through to recalculate

    return calculate_and_update_score(user_id, db)


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
