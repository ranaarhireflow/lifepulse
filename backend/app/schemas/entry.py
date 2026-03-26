import datetime
import uuid

from pydantic import BaseModel, Field


class EntryUpsert(BaseModel):
    value_numeric: float | None = None
    value_numeric2: float | None = None
    value_boolean: bool | None = None
    value_duration: int | None = Field(None, ge=0)
    value_time: str | None = Field(None, pattern=r"^\d{2}:\d{2}$")
    value_text: str | None = None
    note: str | None = None


class EntryResponse(BaseModel):
    id: uuid.UUID
    tracker_id: uuid.UUID
    date: datetime.date
    value_numeric: float | None
    value_numeric2: float | None
    value_boolean: bool | None
    value_duration: int | None
    value_time: str | None
    value_text: str | None
    note: str | None

    model_config = {"from_attributes": True}


class DailyTrackerEntry(BaseModel):
    tracker: "TrackerBrief"
    entry: EntryResponse | None
    default_value: float | None = None  # carry-forward or zero


class TrackerBrief(BaseModel):
    id: uuid.UUID
    name: str
    icon: str | None
    color: str | None
    type: str
    unit: str | None
    unit_secondary: str | None
    default_behavior: str
    target_value: float | None
    reminder_enabled: bool = False

    model_config = {"from_attributes": True}
