import os
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

security = HTTPBearer(auto_error=False)

DEV_FIREBASE_UID = "dev-user-001"
DEV_MODE = not os.environ.get("FIREBASE_PROJECT_ID")


async def get_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Session = Depends(get_db),
) -> User:
    """Verify auth and return the corresponding user."""

    # Dev mode: use X-Dev-Mode header
    if DEV_MODE and request.headers.get("X-Dev-Mode") == "true":
        user = db.query(User).filter(User.firebase_uid == DEV_FIREBASE_UID).first()
        if not user:
            user = User(
                firebase_uid=DEV_FIREBASE_UID,
                email="dev@mypersonaltracker.app",
                display_name="Dev User",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    # Production: verify Firebase token
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from app.services.firebase import verify_firebase_token

    try:
        decoded = verify_firebase_token(credentials.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    firebase_uid = decoded.get("uid")
    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing UID",
        )

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please log in first.",
        )

    return user
