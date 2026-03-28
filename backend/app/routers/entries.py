import datetime
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.tracker import Tracker, DefaultBehavior
from app.models.entry import Entry
from app.schemas.entry import EntryUpsert, EntryResponse, DailyTrackerEntry, TrackerBrief
from app.services.monk_score import calculate_and_update_score

router = APIRouter()

EDIT_WINDOW_DAYS = 5


@router.get("", response_model=list[EntryResponse])
def list_entries(
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    date: datetime.date | None = None,
    tracker_id: uuid.UUID | None = None,
    date_from: datetime.date | None = Query(None, alias="from"),
    date_to: datetime.date | None = Query(None, alias="to"),
):
    query = db.query(Entry).filter(Entry.user_id == user.id, Entry.is_active == True)

    if date:
        query = query.filter(Entry.date == date)
    if tracker_id:
        query = query.filter(Entry.tracker_id == tracker_id)
    if date_from:
        query = query.filter(Entry.date >= date_from)
    if date_to:
        query = query.filter(Entry.date <= date_to)

    return query.order_by(Entry.date.desc()).limit(1000).all()


@router.get("/bulk", response_model=list[DailyTrackerEntry])
def bulk_daily(
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    date: datetime.date = Query(default_factory=datetime.date.today),
):
    """Get all active trackers with their entries for a given date (daily view)."""
    trackers = (
        db.query(Tracker)
        .filter(Tracker.user_id == user.id, Tracker.archived == False)
        .order_by(Tracker.sort_order)
        .all()
    )

    entries_map: dict[str, Entry] = {}
    entries = db.query(Entry).filter(
        Entry.user_id == user.id,
        Entry.date == date,
    ).all()
    for entry in entries:
        entries_map[str(entry.tracker_id)] = entry

    result = []
    for tracker in trackers:
        tid = str(tracker.id)
        entry = entries_map.get(tid)
        default_value = None

        if not entry and tracker.default_behavior == DefaultBehavior.ZERO:
            default_value = 0.0
        elif not entry and tracker.default_behavior == DefaultBehavior.CARRY_FORWARD:
            prev = (
                db.query(Entry)
                .filter(Entry.tracker_id == tracker.id, Entry.date < date)
                .order_by(Entry.date.desc())
                .first()
            )
            if prev and prev.value_numeric is not None:
                default_value = prev.value_numeric

        result.append(DailyTrackerEntry(
            tracker=TrackerBrief(
                id=tid,
                name=tracker.name,
                icon=tracker.icon,
                color=tracker.color,
                type=tracker.type.value,
                unit=tracker.unit,
                unit_secondary=tracker.unit_secondary,
                default_behavior=tracker.default_behavior.value,
                target_value=tracker.target_value,
                reminder_enabled=tracker.reminder_enabled or (len(tracker.alerts) > 0 if tracker.alerts else False),
                dimension=tracker.dimension,
            ),
            entry=entry,
            default_value=default_value,
        ))

    return result


@router.put("/{tracker_id}/{date}", response_model=EntryResponse)
def upsert_entry(
    tracker_id: uuid.UUID,
    date: datetime.date,
    data: EntryUpsert,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    # Enforce edit window
    today = datetime.date.today()
    if date > today:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot log entries in the future")
    if (today - date).days > EDIT_WINDOW_DAYS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot edit entries older than {EDIT_WINDOW_DAYS} days",
        )

    # Verify tracker belongs to user
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    # Upsert
    entry = db.query(Entry).filter(Entry.tracker_id == tracker_id, Entry.date == date).first()
    if entry:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(entry, field, value)
        entry.logged_timezone = user.timezone
    else:
        entry = Entry(
            tracker_id=tracker_id,
            user_id=user.id,
            date=date,
            logged_timezone=user.timezone,
            **data.model_dump(exclude_unset=True),
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)

    # Recalculate monk score in real-time after logging
    try:
        calculate_and_update_score(user.id, db)
    except Exception:
        pass  # Don't fail the entry upsert if scoring fails

    return entry


@router.delete("/{tracker_id}/{date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    tracker_id: uuid.UUID,
    date: datetime.date,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    entry = db.query(Entry).filter(
        Entry.tracker_id == tracker_id,
        Entry.user_id == user.id,
        Entry.date == date,
    ).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    # Soft delete
    from datetime import timezone as tz
    entry.is_active = False
    entry.deleted_at = datetime.datetime.now(tz.utc)
    db.commit()
