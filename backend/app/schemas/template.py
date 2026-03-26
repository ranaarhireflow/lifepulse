import uuid

from pydantic import BaseModel


class TemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    icon: str | None
    color: str | None
    type: str
    unit: str | None
    unit_secondary: str | None
    default_behavior: str
    category: str | None

    model_config = {"from_attributes": True}
