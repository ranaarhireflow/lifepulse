import datetime
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func as sqlfunc
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.tracker import Tracker
from app.models.entry import Entry
from app.schemas.analytics import TrackerAnalytics, DataPoint, HeatmapData, HeatmapDay

router = APIRouter()


def _calculate_streaks(entries: list[Entry], tracker_type: str) -> tuple[int, int]:
    """Calculate current and longest streak from entries sorted by date ascending."""
    if not entries:
        return 0, 0

    dates_completed = set()
    for e in entries:
        completed = False
        if tracker_type == "BOOLEAN":
            completed = e.value_boolean is True
        elif tracker_type in ("NUMERIC", "DUAL_NUMERIC"):
            completed = e.value_numeric is not None
        elif tracker_type == "DURATION":
            completed = e.value_duration is not None and e.value_duration > 0
        elif tracker_type == "TIME":
            completed = e.value_time is not None
        elif tracker_type == "TEXT":
            completed = e.value_text is not None and len(e.value_text.strip()) > 0
        if completed:
            dates_completed.add(e.date)

    if not dates_completed:
        return 0, 0

    sorted_dates = sorted(dates_completed)
    longest = 1
    current = 1

    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            current += 1
            longest = max(longest, current)
        else:
            current = 1

    # Check if current streak extends to today
    today = datetime.date.today()
    if sorted_dates[-1] < today - datetime.timedelta(days=1):
        current_streak = 0
    else:
        current_streak = 1
        for i in range(len(sorted_dates) - 2, -1, -1):
            if (sorted_dates[i + 1] - sorted_dates[i]).days == 1:
                current_streak += 1
            else:
                break

    return current_streak, longest


@router.get("/{tracker_id}", response_model=TrackerAnalytics)
def get_tracker_analytics(
    tracker_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    date_from: datetime.date = Query(alias="from", default=None),
    date_to: datetime.date = Query(alias="to", default=None),
):
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    if not date_to:
        date_to = datetime.date.today()
    if not date_from:
        date_from = date_to - datetime.timedelta(days=30)

    entries = (
        db.query(Entry)
        .filter(Entry.tracker_id == tracker_id, Entry.date >= date_from, Entry.date <= date_to)
        .order_by(Entry.date)
        .all()
    )

    data_points = []
    for e in entries:
        val = e.value_numeric if e.value_numeric is not None else (1.0 if e.value_boolean else None)
        data_points.append(DataPoint(date=e.date, value=val, value2=e.value_numeric2))

    numeric_values = [dp.value for dp in data_points if dp.value is not None]
    total_days = (date_to - date_from).days + 1

    current_streak, longest_streak = _calculate_streaks(entries, tracker.type.value)

    return TrackerAnalytics(
        tracker_id=str(tracker.id),
        tracker_name=tracker.name,
        tracker_type=tracker.type.value,
        unit=tracker.unit,
        data_points=data_points,
        average=round(sum(numeric_values) / len(numeric_values), 2) if numeric_values else None,
        min_value=min(numeric_values) if numeric_values else None,
        max_value=max(numeric_values) if numeric_values else None,
        current_streak=current_streak,
        longest_streak=longest_streak,
        completion_rate=round(len(entries) / total_days * 100, 1) if total_days > 0 else 0,
        total_entries=len(entries),
    )


@router.get("/{tracker_id}/heatmap", response_model=HeatmapData)
def get_heatmap(
    tracker_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    date_from: datetime.date = Query(alias="from", default=None),
    date_to: datetime.date = Query(alias="to", default=None),
):
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    if not date_to:
        date_to = datetime.date.today()
    if not date_from:
        date_from = date_to - datetime.timedelta(days=365)

    entries = (
        db.query(Entry)
        .filter(Entry.tracker_id == tracker_id, Entry.date >= date_from, Entry.date <= date_to)
        .all()
    )

    entry_map = {e.date: e for e in entries}
    days = []
    current = date_from
    while current <= date_to:
        e = entry_map.get(current)
        if e:
            val = e.value_numeric if e.value_numeric is not None else (1.0 if e.value_boolean else 0.0)
            completed = True
        else:
            val = None
            completed = False
        days.append(HeatmapDay(date=current, value=val, completed=completed))
        current += datetime.timedelta(days=1)

    return HeatmapData(tracker_id=str(tracker.id), days=days)
