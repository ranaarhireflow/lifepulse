import datetime
import uuid

from pydantic import BaseModel


class DataPoint(BaseModel):
    date: datetime.date
    value: float | None
    value2: float | None = None
    is_default: bool = False


class TrackerAnalytics(BaseModel):
    tracker_id: uuid.UUID
    tracker_name: str
    tracker_type: str
    unit: str | None
    data_points: list[DataPoint]
    average: float | None
    min_value: float | None
    max_value: float | None
    current_streak: int
    longest_streak: int
    completion_rate: float
    total_entries: int


class HeatmapDay(BaseModel):
    date: datetime.date
    value: float | None
    completed: bool


class HeatmapData(BaseModel):
    tracker_id: uuid.UUID
    days: list[HeatmapDay]
