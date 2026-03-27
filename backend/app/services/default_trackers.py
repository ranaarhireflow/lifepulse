"""Create default trackers for new users with medically/scientifically sensible ranges."""
import uuid
from sqlalchemy.orm import Session

from app.models.tracker import Tracker, TrackerType, DefaultBehavior
from app.models.tracker_alert import TrackerAlert

DEFAULT_TRACKERS = [
    {
        "name": "Weight",
        "icon": "⚖️",
        "color": "#6366f1",
        "type": TrackerType.NUMERIC,
        "unit": "kg",
        "default_behavior": DefaultBehavior.CARRY_FORWARD,
        "target_value": 72.0,
        "min_value": 30.0,      # Lightest reasonable adult
        "max_value": 200.0,     # Heaviest reasonable
        "dimension": "focus",
        "alerts": [{"alert_time": "08:00", "label": "Log your weight"}],
    },
    {
        "name": "Blood Pressure",
        "icon": "❤️",
        "color": "#ef4444",
        "type": TrackerType.DUAL_NUMERIC,
        "unit": "systolic",
        "unit_secondary": "diastolic",
        "default_behavior": DefaultBehavior.NULL,
        "min_value": 60.0,      # Systolic low
        "max_value": 250.0,     # Systolic emergency high
        "dimension": "confidence",
        "tracking_days": [1, 4],  # Mon + Thu (twice a week)
        "times_per_day": 2,       # Morning + evening
        "alerts": [
            {"alert_time": "08:00", "label": "Morning BP check"},
            {"alert_time": "20:00", "label": "Evening BP check"},
        ],
    },
    {
        "name": "Sleep Time",
        "icon": "🌙",
        "color": "#8b5cf6",
        "type": TrackerType.TIME,
        "unit": None,
        "default_behavior": DefaultBehavior.NULL,
        "dimension": "discipline",
        "alerts": [{"alert_time": "22:30", "label": "Time to sleep!"}],
    },
    {
        "name": "Wake Up Time",
        "icon": "🌅",
        "color": "#f59e0b",
        "type": TrackerType.TIME,
        "unit": None,
        "default_behavior": DefaultBehavior.NULL,
        "dimension": "discipline",
        "alerts": [{"alert_time": "07:00", "label": "Log wake up time"}],
    },
    {
        "name": "Pages Read",
        "icon": "📖",
        "color": "#84cc16",
        "type": TrackerType.NUMERIC,
        "unit": "pages",
        "default_behavior": DefaultBehavior.ZERO,
        "target_value": 10.0,
        "min_value": 0.0,
        "max_value": 200.0,     # Avid reader upper bound
        "dimension": "wisdom",
        "alerts": [{"alert_time": "21:00", "label": "Read before bed"}],
    },
    {
        "name": "Brush & Bathe",
        "icon": "🪥",
        "color": "#38bdf8",
        "type": TrackerType.BOOLEAN,
        "unit": None,
        "default_behavior": DefaultBehavior.ZERO,
        "dimension": "discipline",
        "alerts": [{"alert_time": "07:30", "label": "Morning routine"}],
    },
    {
        "name": "Deep Work",
        "icon": "🧠",
        "color": "#6366f1",
        "type": TrackerType.DURATION,
        "unit": "min",
        "default_behavior": DefaultBehavior.ZERO,
        "target_value": 240.0,  # 4 hours
        "min_value": 0.0,
        "max_value": 600.0,     # 10 hours max
        "dimension": "wisdom",
        "alerts": [{"alert_time": "09:30", "label": "Start deep work session"}],
    },
    {
        "name": "Water Intake",
        "icon": "💧",
        "color": "#3b82f6",
        "type": TrackerType.NUMERIC,
        "unit": "glasses",
        "default_behavior": DefaultBehavior.ZERO,
        "target_value": 8.0,    # 8 glasses (~2L)
        "min_value": 0.0,
        "max_value": 15.0,      # Max realistic glasses/day
        "dimension": "discipline",
        "times_per_day": 4,
        "alerts": [
            {"alert_time": "09:00", "label": "Drink water 💧"},
            {"alert_time": "12:00", "label": "Hydration check 💧"},
            {"alert_time": "15:00", "label": "Afternoon water 💧"},
            {"alert_time": "18:00", "label": "Evening hydration 💧"},
        ],
    },
]


def create_default_trackers(user_id: uuid.UUID, db: Session) -> None:
    """Create default trackers for a new user."""
    existing = db.query(Tracker).filter(Tracker.user_id == user_id).count()
    if existing > 0:
        return

    for idx, t_data in enumerate(DEFAULT_TRACKERS):
        # Copy to avoid mutating the default
        data = dict(t_data)
        alerts_data = data.pop("alerts", [])
        tracker = Tracker(
            user_id=user_id,
            sort_order=idx,
            **data,
        )
        db.add(tracker)
        db.flush()

        for alert_data in alerts_data:
            alert = TrackerAlert(
                tracker_id=tracker.id,
                alert_time=alert_data["alert_time"],
                alert_days=[1, 2, 3, 4, 5, 6, 7],
                label=alert_data.get("label"),
                enabled=True,
            )
            db.add(alert)

    db.commit()
