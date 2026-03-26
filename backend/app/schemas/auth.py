from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    id_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str | None
    photo_url: str | None
    timezone: str

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    display_name: str | None = None
    timezone: str | None = None
    photo_url: str | None = None
