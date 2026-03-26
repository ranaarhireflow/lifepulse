"""Seed achievements into the database."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:JLUrhRAIXwiiAlmQSOvRUmWlPtdpbOpn@ballast.proxy.rlwy.net:16370/railway",
)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

from app.models.achievement import Achievement

ACHIEVEMENTS = [
    # Streak
    {"name": "First Flame", "description": "Reach a 3-day streak on any pulse", "icon": "🔥", "category": "streak", "condition_type": "streak_days", "condition_value": 3, "xp_reward": 25, "sort_order": 1},
    {"name": "Week Warrior", "description": "Maintain a 7-day streak", "icon": "⚔️", "category": "streak", "condition_type": "streak_days", "condition_value": 7, "xp_reward": 50, "sort_order": 2},
    {"name": "Fortnight Fighter", "description": "14-day streak — you're building real discipline", "icon": "🛡️", "category": "streak", "condition_type": "streak_days", "condition_value": 14, "xp_reward": 100, "sort_order": 3},
    {"name": "Month Master", "description": "30-day streak — the habit is forming", "icon": "👑", "category": "streak", "condition_type": "streak_days", "condition_value": 30, "xp_reward": 200, "sort_order": 4},
    {"name": "The Monk", "description": "66-day streak — science says the habit is permanent", "icon": "🧘", "category": "streak", "condition_type": "streak_days", "condition_value": 66, "xp_reward": 500, "sort_order": 5},
    {"name": "Century", "description": "100-day streak — you are unstoppable", "icon": "💯", "category": "streak", "condition_type": "streak_days", "condition_value": 100, "xp_reward": 1000, "sort_order": 6},

    # Entries
    {"name": "First Step", "description": "Log your first entry", "icon": "👣", "category": "entries", "condition_type": "total_entries", "condition_value": 1, "xp_reward": 10, "sort_order": 10},
    {"name": "Getting Started", "description": "Log 10 entries", "icon": "🌱", "category": "entries", "condition_type": "total_entries", "condition_value": 10, "xp_reward": 25, "sort_order": 11},
    {"name": "Half Century", "description": "Log 50 entries", "icon": "📊", "category": "entries", "condition_type": "total_entries", "condition_value": 50, "xp_reward": 75, "sort_order": 12},
    {"name": "Data Driven", "description": "Log 100 entries", "icon": "📈", "category": "entries", "condition_type": "total_entries", "condition_value": 100, "xp_reward": 150, "sort_order": 13},
    {"name": "Dedicated", "description": "Log 500 entries", "icon": "💎", "category": "entries", "condition_type": "total_entries", "condition_value": 500, "xp_reward": 300, "sort_order": 14},
    {"name": "Enlightened", "description": "Log 1000 entries", "icon": "✨", "category": "entries", "condition_type": "total_entries", "condition_value": 1000, "xp_reward": 500, "sort_order": 15},

    # Consistency
    {"name": "Perfect Day", "description": "Log all your pulses in one day", "icon": "⭐", "category": "consistency", "condition_type": "all_logged_today", "condition_value": 1, "xp_reward": 30, "sort_order": 20},
    {"name": "Perfect Week", "description": "Log every pulse every day for 7 days straight", "icon": "🌟", "category": "consistency", "condition_type": "perfect_week", "condition_value": 1, "xp_reward": 200, "sort_order": 21},

    # Milestones
    {"name": "Pulse Creator", "description": "Create your first pulse", "icon": "🎯", "category": "milestone", "condition_type": "total_pulses", "condition_value": 1, "xp_reward": 15, "sort_order": 30},
    {"name": "Multi-Tracker", "description": "Have 5 active pulses", "icon": "📋", "category": "milestone", "condition_type": "total_pulses", "condition_value": 5, "xp_reward": 50, "sort_order": 31},
    {"name": "Level 5", "description": "Reach Monk Level 5", "icon": "🏅", "category": "milestone", "condition_type": "level", "condition_value": 5, "xp_reward": 100, "sort_order": 32},
    {"name": "Level 10", "description": "Reach Monk Level 10", "icon": "🥇", "category": "milestone", "condition_type": "level", "condition_value": 10, "xp_reward": 200, "sort_order": 33},
    {"name": "Level 25", "description": "Reach Monk Level 25 — true dedication", "icon": "🏆", "category": "milestone", "condition_type": "level", "condition_value": 25, "xp_reward": 500, "sort_order": 34},

    # Secret
    {"name": "???", "description": "Hidden achievement", "icon": "❓", "category": "secret", "condition_type": "streak_days", "condition_value": 50, "xp_reward": 300, "is_secret": True, "sort_order": 40},
    {"name": "???", "description": "Hidden achievement", "icon": "❓", "category": "secret", "condition_type": "total_entries", "condition_value": 250, "xp_reward": 200, "is_secret": True, "sort_order": 41},
]


def seed():
    db = Session()
    try:
        existing = db.query(Achievement).count()
        if existing > 0:
            print(f"Achievements already seeded ({existing} found). Skipping.")
            return

        for a in ACHIEVEMENTS:
            db.add(Achievement(**a))
        db.commit()
        print(f"Seeded {len(ACHIEVEMENTS)} achievements.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
