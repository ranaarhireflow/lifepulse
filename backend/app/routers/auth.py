import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user, DEV_FIREBASE_UID, DEV_MODE
from app.models.user import User
from app.schemas.auth import LoginRequest, UserResponse, UserUpdate

router = APIRouter()


@router.post("/dev-login", response_model=UserResponse)
def dev_login(db: Session = Depends(get_db)):
    """Dev mode: create/return dev user without Firebase. Always available for local testing."""
    user = db.query(User).filter(User.firebase_uid == DEV_FIREBASE_UID).first()
    if not user:
        user = User(
            firebase_uid=DEV_FIREBASE_UID,
            email="dev@mypersonaltracker.app",
            display_name="Rajat",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


@router.post("/login", response_model=UserResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Verify Firebase token and create/update user record."""
    import os
    from app.config import settings

    decoded = None
    if os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
        # Full verification with service account
        from app.services.firebase import verify_firebase_token
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
    else:
        # Lightweight: decode without full verification (no service account)
        from jose import jwt
        try:
            decoded = jwt.get_unverified_claims(request.id_token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format",
            )
        firebase_uid = decoded.get("user_id") or decoded.get("sub", "")
        email = decoded.get("email", "")
        display_name = decoded.get("name", "")
        photo_url = decoded.get("picture", "")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    is_new = user is None
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

    # Reactivate if previously deactivated or cancel pending deletion
    if not is_new and not user.is_active:
        user.is_active = True
        user.deleted_at = None
        user.scheduled_purge_at = None
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


@router.post("/deactivate", status_code=status.HTTP_200_OK)
def deactivate_account(
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Deactivate account — data preserved, reactivated on next login."""
    user.is_active = False
    db.commit()
    return {"status": "deactivated", "message": "Your account has been deactivated. Log in again anytime to reactivate."}


@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_account(
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Request account deletion — 7-day grace period before permanent purge."""
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    user.is_active = False
    user.deleted_at = now
    user.scheduled_purge_at = now + timedelta(days=7)
    db.commit()
    return {
        "status": "deletion_scheduled",
        "message": "Your account is scheduled for deletion. Log back in within 7 days to cancel.",
        "purge_date": str(user.scheduled_purge_at.date()),
    }
