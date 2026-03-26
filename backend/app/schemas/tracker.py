import uuid

from pydantic import BaseModel, Field
from app.models.tracker import TrackerType, DefaultBehavior


class TrackerAlertCreate(BaseModel):
    alert_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    alert_days: list[int] = Field(default=[1, 2, 3, 4, 5, 6, 7])
    label: str | None = None
    enabled: bool = True


class TrackerAlertResponse(BaseModel):
    id: uuid.UUID
    alert_time: str
    alert_days: list[int]
    label: str | None
    enabled: bool

    model_config = {"from_attributes": True}


class TrackerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    icon: str | None = None
    color: str | None = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    type: TrackerType
    unit: str | None = None
    unit_secondary: str | None = None
    default_behavior: DefaultBehavior = DefaultBehavior.NULL
    min_value: float | None = None
    max_value: float | None = None
    streak_goal: int | None = None
    target_value: float | None = None
    alerts: list[TrackerAlertCreate] = []


class TrackerUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    icon: str | None = None
    color: str | None = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    unit: str | None = None
    unit_secondary: str | None = None
    default_behavior: DefaultBehavior | None = None
    reminder_enabled: bool | None = None
    min_value: float | None = None
    max_value: float | None = None
    streak_goal: int | None = None
    target_value: float | None = None
    archived: bool | None = None


class TrackerResponse(BaseModel):
    id: uuid.UUID
    name: str
    icon: str | None
    color: str | None
    type: TrackerType
    unit: str | None
    unit_secondary: str | None
    default_behavior: DefaultBehavior
    sort_order: int
    archived: bool
    reminder_enabled: bool
    min_value: float | None
    max_value: float | None
    streak_goal: int | None
    target_value: float | None
    alerts: list[TrackerAlertResponse] = []

    model_config = {"from_attributes": True}


class TrackerReorder(BaseModel):
    tracker_ids: list[uuid.UUID]
