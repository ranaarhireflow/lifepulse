"""Seed tracker templates into the database."""
from app.database import SessionLocal
from app.models.tracker_template import TrackerTemplate
from app.models.tracker import TrackerType, DefaultBehavior

TEMPLATES = [
    # Health
    {"name": "Weight", "icon": "⚖️", "color": "#6366f1", "type": TrackerType.NUMERIC, "unit": "kg", "default_behavior": DefaultBehavior.CARRY_FORWARD, "category": "Health"},
    {"name": "Blood Pressure", "icon": "❤️", "color": "#ef4444", "type": TrackerType.DUAL_NUMERIC, "unit": "systolic", "unit_secondary": "diastolic", "default_behavior": DefaultBehavior.NULL, "category": "Health"},
    {"name": "Water Intake", "icon": "💧", "color": "#3b82f6", "type": TrackerType.NUMERIC, "unit": "glasses", "default_behavior": DefaultBehavior.ZERO, "category": "Health"},
    {"name": "Sleep Time", "icon": "😴", "color": "#8b5cf6", "type": TrackerType.TIME, "unit": None, "default_behavior": DefaultBehavior.NULL, "category": "Health"},
    {"name": "Wake Up Time", "icon": "🌅", "color": "#f59e0b", "type": TrackerType.TIME, "unit": None, "default_behavior": DefaultBehavior.NULL, "category": "Health"},
    {"name": "Steps", "icon": "👣", "color": "#10b981", "type": TrackerType.NUMERIC, "unit": "steps", "default_behavior": DefaultBehavior.ZERO, "category": "Health"},
    {"name": "Calories", "icon": "🔥", "color": "#f97316", "type": TrackerType.NUMERIC, "unit": "kcal", "default_behavior": DefaultBehavior.ZERO, "category": "Health"},
    {"name": "Heart Rate", "icon": "💓", "color": "#ec4899", "type": TrackerType.NUMERIC, "unit": "bpm", "default_behavior": DefaultBehavior.NULL, "category": "Health"},

    # Fitness
    {"name": "Gym", "icon": "🏋️", "color": "#22c55e", "type": TrackerType.BOOLEAN, "unit": None, "default_behavior": DefaultBehavior.ZERO, "category": "Fitness"},
    {"name": "Running", "icon": "🏃", "color": "#14b8a6", "type": TrackerType.NUMERIC, "unit": "km", "default_behavior": DefaultBehavior.ZERO, "category": "Fitness"},
    {"name": "Workout Duration", "icon": "⏱️", "color": "#06b6d4", "type": TrackerType.DURATION, "unit": "min", "default_behavior": DefaultBehavior.ZERO, "category": "Fitness"},
    {"name": "Workout Notes", "icon": "📝", "color": "#64748b", "type": TrackerType.TEXT, "unit": None, "default_behavior": DefaultBehavior.NULL, "category": "Fitness"},
    {"name": "Yoga", "icon": "🧘", "color": "#a855f7", "type": TrackerType.BOOLEAN, "unit": None, "default_behavior": DefaultBehavior.ZERO, "category": "Fitness"},

    # Productivity
    {"name": "Deep Work", "icon": "🧠", "color": "#6366f1", "type": TrackerType.DURATION, "unit": "min", "default_behavior": DefaultBehavior.ZERO, "category": "Productivity"},
    {"name": "Books Pages Read", "icon": "📖", "color": "#84cc16", "type": TrackerType.NUMERIC, "unit": "pages", "default_behavior": DefaultBehavior.ZERO, "category": "Productivity"},
    {"name": "Meditation", "icon": "🧘‍♂️", "color": "#d946ef", "type": TrackerType.DURATION, "unit": "min", "default_behavior": DefaultBehavior.ZERO, "category": "Productivity"},
    {"name": "Journaling", "icon": "✍️", "color": "#78716c", "type": TrackerType.BOOLEAN, "unit": None, "default_behavior": DefaultBehavior.ZERO, "category": "Productivity"},
    {"name": "Screen Time", "icon": "📱", "color": "#f43f5e", "type": TrackerType.DURATION, "unit": "min", "default_behavior": DefaultBehavior.ZERO, "category": "Productivity"},

    # Lifestyle
    {"name": "No Junk Food", "icon": "🥗", "color": "#22c55e", "type": TrackerType.BOOLEAN, "unit": None, "default_behavior": DefaultBehavior.ZERO, "category": "Lifestyle"},
    {"name": "No Alcohol", "icon": "🚫", "color": "#ef4444", "type": TrackerType.BOOLEAN, "unit": None, "default_behavior": DefaultBehavior.ZERO, "category": "Lifestyle"},
    {"name": "Gratitude", "icon": "🙏", "color": "#eab308", "type": TrackerType.TEXT, "unit": None, "default_behavior": DefaultBehavior.NULL, "category": "Lifestyle"},
    {"name": "Mood", "icon": "😊", "color": "#f59e0b", "type": TrackerType.NUMERIC, "unit": "/10", "default_behavior": DefaultBehavior.NULL, "category": "Lifestyle"},
    {"name": "Money Spent", "icon": "💰", "color": "#16a34a", "type": TrackerType.NUMERIC, "unit": "₹", "default_behavior": DefaultBehavior.ZERO, "category": "Lifestyle"},
    {"name": "Brush & Bathe", "icon": "🪥", "color": "#38bdf8", "type": TrackerType.BOOLEAN, "unit": None, "default_behavior": DefaultBehavior.ZERO, "category": "Lifestyle"},
    {"name": "Sleep by 11pm", "icon": "🌙", "color": "#c084fc", "type": TrackerType.BOOLEAN, "unit": None, "default_behavior": DefaultBehavior.ZERO, "category": "Lifestyle"},
    {"name": "Coffee Cups", "icon": "☕", "color": "#92400e", "type": TrackerType.NUMERIC, "unit": "cups", "default_behavior": DefaultBehavior.ZERO, "category": "Lifestyle"},
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(TrackerTemplate).count()
        if existing > 0:
            print(f"Templates already seeded ({existing} found). Skipping.")
            return

        for t in TEMPLATES:
            template = TrackerTemplate(**t)
            db.add(template)

        db.commit()
        print(f"Seeded {len(TEMPLATES)} tracker templates.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
