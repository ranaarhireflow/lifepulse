"""Achievement system — check and unlock achievements."""
import uuid
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.achievement import Achievement, UserAchievement
from app.models.tracker import Tracker
from app.models.entry import Entry
from app.models.monk_score import MonkScore


def check_and_unlock(user_id: uuid.UUID, db: Session) -> list[Achievement]:
    """Check all achievements and unlock any new ones. Returns newly unlocked."""
    all_achievements = db.query(Achievement).all()
    already_unlocked = {
        ua.achievement_id
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    }

    newly_unlocked = []

    for ach in all_achievements:
        if ach.id in already_unlocked:
            continue

        if _check_condition(user_id, ach, db):
            ua = UserAchievement(user_id=user_id, achievement_id=ach.id)
            db.add(ua)
            newly_unlocked.append(ach)

            # Award XP
            score = db.query(MonkScore).filter(MonkScore.user_id == user_id).first()
            if score:
                score.xp_total += ach.xp_reward

    if newly_unlocked:
        db.commit()

    return newly_unlocked


def _check_condition(user_id: uuid.UUID, ach: Achievement, db: Session) -> bool:
    """Check if a specific achievement condition is met."""
    ct = ach.condition_type
    cv = ach.condition_value

    if ct == "total_entries":
        count = db.query(Entry).filter(Entry.user_id == user_id, Entry.is_active == True).count()
        return count >= cv

    if ct == "total_pulses":
        count = db.query(Tracker).filter(Tracker.user_id == user_id, Tracker.is_active == True).count()
        return count >= cv

    if ct == "streak_days":
        # Check if any tracker has a streak >= cv
        trackers = db.query(Tracker).filter(Tracker.user_id == user_id, Tracker.is_active == True).all()
        for t in trackers:
            streak = _get_streak(t.id, db)
            if streak >= cv:
                return True
        return False

    if ct == "level":
        score = db.query(MonkScore).filter(MonkScore.user_id == user_id).first()
        return score is not None and score.level >= cv

    if ct == "perfect_week":
        # All active trackers logged every day for 7 days
        trackers = db.query(Tracker).filter(Tracker.user_id == user_id, Tracker.is_active == True).all()
        if not trackers:
            return False
        today = date.today()
        for days_back in range(7):
            d = today - timedelta(days=days_back)
            for t in trackers:
                entry = db.query(Entry).filter(
                    Entry.tracker_id == t.id, Entry.date == d, Entry.is_active == True
                ).first()
                if not entry:
                    return False
        return True

    if ct == "all_logged_today":
        trackers = db.query(Tracker).filter(Tracker.user_id == user_id, Tracker.is_active == True).all()
        if not trackers:
            return False
        today = date.today()
        for t in trackers:
            entry = db.query(Entry).filter(
                Entry.tracker_id == t.id, Entry.date == today, Entry.is_active == True
            ).first()
            if not entry:
                return False
        return True

    return False


def _get_streak(tracker_id: uuid.UUID, db: Session) -> int:
    """Calculate current streak for a tracker."""
    streak = 0
    check_date = date.today()
    while True:
        entry = db.query(Entry).filter(
            Entry.tracker_id == tracker_id,
            Entry.date == check_date,
            Entry.is_active == True,
        ).first()
        if entry:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    return streak
