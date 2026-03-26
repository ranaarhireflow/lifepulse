import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.tracker import Tracker
from app.models.tracker_template import TrackerTemplate
from app.schemas.template import TemplateResponse
from app.schemas.tracker import TrackerResponse

router = APIRouter()


@router.get("", response_model=list[TemplateResponse])
def list_templates(db: Session = Depends(get_db)):
    return db.query(TrackerTemplate).order_by(TrackerTemplate.category, TrackerTemplate.name).all()


@router.post("/{template_id}/create", response_model=TrackerResponse, status_code=status.HTTP_201_CREATED)
def create_from_template(
    template_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    template = db.query(TrackerTemplate).filter(TrackerTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    max_order = (
        db.query(Tracker.sort_order)
        .filter(Tracker.user_id == user.id)
        .order_by(Tracker.sort_order.desc())
        .first()
    )
    next_order = (max_order[0] + 1) if max_order else 0

    tracker = Tracker(
        user_id=user.id,
        name=template.name,
        icon=template.icon,
        color=template.color,
        type=template.type,
        unit=template.unit,
        unit_secondary=template.unit_secondary,
        default_behavior=template.default_behavior,
        sort_order=next_order,
    )
    db.add(tracker)
    db.commit()
    db.refresh(tracker)
    return tracker
