"""Create dummy user with trackers and 30 days of realistic test data."""
import os
import random
import uuid
from datetime import date, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:JLUrhRAIXwiiAlmQSOvRUmWlPtdpbOpn@ballast.proxy.rlwy.net:16370/railway",
)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

from app.models.user import User
from app.models.tracker import Tracker, TrackerType, DefaultBehavior
from app.models.tracker_alert import TrackerAlert
from app.models.entry import Entry

DUMMY_UID = "dummy-test-user-001"

TRACKERS = [
    {
        "name": "Weight",
        "icon": "⚖️",
        "color": "#6366f1",
        "type": TrackerType.NUMERIC,
        "unit": "kg",
        "default_behavior": DefaultBehavior.CARRY_FORWARD,
        "target_value": 72.0,
        "gen": lambda day: round(random.uniform(73.5, 75.5) - day * 0.03, 1),
    },
    {
        "name": "Water Intake",
        "icon": "💧",
        "color": "#3b82f6",
        "type": TrackerType.NUMERIC,
        "unit": "glasses",
        "default_behavior": DefaultBehavior.ZERO,
        "target_value": 8.0,
        "gen": lambda day: random.randint(4, 10),
    },
    {
        "name": "Gym",
        "icon": "🏋️",
        "color": "#22c55e",
        "type": TrackerType.BOOLEAN,
        "unit": None,
        "default_behavior": DefaultBehavior.ZERO,
        "target_value": None,
        "gen": lambda day: random.random() > 0.35,  # ~65% gym days
    },
    {
        "name": "Deep Work",
        "icon": "🧠",
        "color": "#8b5cf6",
        "type": TrackerType.DURATION,
        "unit": "min",
        "default_behavior": DefaultBehavior.ZERO,
        "target_value": 240.0,
        "gen": lambda day: random.randint(60, 300),
    },
    {
        "name": "Pages Read",
        "icon": "📖",
        "color": "#84cc16",
        "type": TrackerType.NUMERIC,
        "unit": "pages",
        "default_behavior": DefaultBehavior.ZERO,
        "target_value": 10.0,
        "gen": lambda day: random.randint(0, 25),
    },
    {
        "name": "Sleep Time",
        "icon": "🌙",
        "color": "#c084fc",
        "type": TrackerType.TIME,
        "unit": None,
        "default_behavior": DefaultBehavior.NULL,
        "target_value": None,
        "gen": lambda day: f"{random.choice([22, 23])}:{random.choice(['00', '15', '30', '45'])}",
    },
]


def seed():
    db = Session()
    try:
        # Create or get dummy user
        user = db.query(User).filter(User.firebase_uid == DUMMY_UID).first()
        if user:
            print(f"Dummy user already exists: {user.email}")
            # Clean existing trackers/entries for fresh seed
            for tracker in db.query(Tracker).filter(Tracker.user_id == user.id).all():
                db.query(Entry).filter(Entry.tracker_id == tracker.id).delete()
                db.query(TrackerAlert).filter(TrackerAlert.tracker_id == tracker.id).delete()
            db.query(Tracker).filter(Tracker.user_id == user.id).delete()
            db.commit()
        else:
            user = User(
                firebase_uid=DUMMY_UID,
                email="demo@mypersonaltracker.app",
                display_name="Demo User",
                photo_url=None,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created dummy user: {user.email}")

        today = date.today()
        total_entries = 0

        for idx, t_data in enumerate(TRACKERS):
            gen_fn = t_data.pop("gen")

            tracker = Tracker(
                user_id=user.id,
                sort_order=idx,
                **t_data,
            )
            db.add(tracker)
            db.flush()

            # Add alerts
            alert_times = ["08:00"] if t_data["type"] != TrackerType.TIME else ["22:00"]
            if t_data.get("name") == "Water Intake":
                alert_times = ["09:00", "12:00", "15:00", "18:00"]
            for at in alert_times:
                alert = TrackerAlert(
                    tracker_id=tracker.id,
                    alert_time=at,
                    alert_days=[1, 2, 3, 4, 5, 6, 7],
                    label=f"Log {tracker.name}",
                    enabled=True,
                )
                db.add(alert)

            # Generate 30 days of data (skip some days randomly for realism)
            for days_ago in range(30, -1, -1):
                # Skip ~15% of days for realism
                if random.random() < 0.15 and days_ago > 0:
                    continue

                entry_date = today - timedelta(days=days_ago)
                val = gen_fn(days_ago)

                entry_kwargs = {
                    "tracker_id": tracker.id,
                    "user_id": user.id,
                    "date": entry_date,
                }

                if tracker.type == TrackerType.NUMERIC:
                    entry_kwargs["value_numeric"] = val
                elif tracker.type == TrackerType.BOOLEAN:
                    entry_kwargs["value_boolean"] = val
                elif tracker.type == TrackerType.DURATION:
                    entry_kwargs["value_duration"] = val
                elif tracker.type == TrackerType.TIME:
                    entry_kwargs["value_time"] = val

                entry = Entry(**entry_kwargs)
                db.add(entry)
                total_entries += 1

        db.commit()
        print(f"Created {len(TRACKERS)} trackers with {total_entries} entries (30 days)")
        print(f"Login with email: demo@mypersonaltracker.app (firebase_uid: {DUMMY_UID})")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
