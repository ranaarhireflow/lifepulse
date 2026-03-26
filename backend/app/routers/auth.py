from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, UserResponse, UserUpdate
from app.services.firebase import verify_firebase_token

router = APIRouter()


@router.post("/login", response_model=UserResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Verify Firebase token and create/update user record."""
    try:
        decoded = verify_firebase_token(request.id_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
        )

    firebase_uid = decoded["uid"]
    email = decoded.get("email", "")
    display_name = decoded.get("name", "")
    photo_url = decoded.get("picture", "")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user:
        user.email = email
        user.display_name = display_name
        user.photo_url = photo_url
    else:
        user = User(
            firebase_uid=firebase_uid,
            email=email,
            display_name=display_name,
            photo_url=photo_url,
        )
        db.add(user)

    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserResponse)
def get_me(user: Annotated[User, Depends(get_current_user)]):
    return user


@router.patch("/me", response_model=UserResponse)
def update_me(
    update: UserUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    db.delete(user)
    db.commit()
