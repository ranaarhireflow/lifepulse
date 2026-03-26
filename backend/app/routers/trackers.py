import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.tracker import Tracker
from app.models.tracker_alert import TrackerAlert
from app.schemas.tracker import (
    TrackerCreate,
    TrackerUpdate,
    TrackerResponse,
    TrackerReorder,
    TrackerAlertCreate,
    TrackerAlertResponse,
)

router = APIRouter()


@router.get("", response_model=list[TrackerResponse])
def list_trackers(
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    include_archived: bool = False,
):
    query = db.query(Tracker).filter(Tracker.user_id == user.id)
    if not include_archived:
        query = query.filter(Tracker.archived == False)
    return query.order_by(Tracker.sort_order, Tracker.created_at).all()


@router.post("", response_model=TrackerResponse, status_code=status.HTTP_201_CREATED)
def create_tracker(
    data: TrackerCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    max_order = (
        db.query(Tracker.sort_order)
        .filter(Tracker.user_id == user.id)
        .order_by(Tracker.sort_order.desc())
        .first()
    )
    next_order = (max_order[0] + 1) if max_order else 0

    tracker = Tracker(
        user_id=user.id,
        name=data.name,
        icon=data.icon,
        color=data.color,
        type=data.type,
        unit=data.unit,
        unit_secondary=data.unit_secondary,
        default_behavior=data.default_behavior,
        min_value=data.min_value,
        max_value=data.max_value,
        streak_goal=data.streak_goal,
        target_value=data.target_value,
        sort_order=next_order,
    )
    db.add(tracker)
    db.flush()

    for alert_data in data.alerts:
        alert = TrackerAlert(
            tracker_id=tracker.id,
            alert_time=alert_data.alert_time,
            alert_days=alert_data.alert_days,
            label=alert_data.label,
            enabled=alert_data.enabled,
        )
        db.add(alert)

    db.commit()
    db.refresh(tracker)
    return tracker


@router.get("/{tracker_id}", response_model=TrackerResponse)
def get_tracker(
    tracker_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")
    return tracker


@router.patch("/{tracker_id}", response_model=TrackerResponse)
def update_tracker(
    tracker_id: uuid.UUID,
    data: TrackerUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(tracker, field, value)

    db.commit()
    db.refresh(tracker)
    return tracker


@router.delete("/{tracker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tracker(
    tracker_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")
    db.delete(tracker)
    db.commit()


@router.patch("/reorder", status_code=status.HTTP_200_OK)
def reorder_trackers(
    data: TrackerReorder,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    for idx, tracker_id in enumerate(data.tracker_ids):
        db.query(Tracker).filter(
            Tracker.id == uuid.UUID(tracker_id),
            Tracker.user_id == user.id,
        ).update({"sort_order": idx})
    db.commit()
    return {"status": "ok"}


@router.post("/{tracker_id}/archive", status_code=status.HTTP_200_OK)
def archive_tracker(
    tracker_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")
    tracker.archived = True
    db.commit()
    return {"status": "archived"}


@router.post("/{tracker_id}/unarchive", status_code=status.HTTP_200_OK)
def unarchive_tracker(
    tracker_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")
    tracker.archived = False
    db.commit()
    return {"status": "unarchived"}


# --- Alerts CRUD ---

@router.post("/{tracker_id}/alerts", response_model=TrackerAlertResponse, status_code=status.HTTP_201_CREATED)
def add_alert(
    tracker_id: uuid.UUID,
    data: TrackerAlertCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    alert = TrackerAlert(
        tracker_id=tracker.id,
        alert_time=data.alert_time,
        alert_days=data.alert_days,
        label=data.label,
        enabled=data.enabled,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.delete("/{tracker_id}/alerts/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    tracker_id: uuid.UUID,
    alert_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    tracker = db.query(Tracker).filter(Tracker.id == tracker_id, Tracker.user_id == user.id).first()
    if not tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    alert = db.query(TrackerAlert).filter(TrackerAlert.id == alert_id, TrackerAlert.tracker_id == tracker.id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    db.delete(alert)
    db.commit()
