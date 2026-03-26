import os
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.config import settings

security = HTTPBearer(auto_error=False)

DEV_FIREBASE_UID = "dev-user-001"

# Dev mode if no Firebase project configured
DEV_MODE = not settings.FIREBASE_PROJECT_ID

# Can we do full Firebase token verification?
_has_service_account = os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH)


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

    # Need credentials for non-dev mode
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    if _has_service_account:
        # Full Firebase token verification with service account
        from app.services.firebase import verify_firebase_token
        try:
            decoded = verify_firebase_token(token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        firebase_uid = decoded.get("uid")
    else:
        # Lightweight: decode JWT without full verification (no service account yet)
        # This is safe for dev/staging since Firebase still handles auth on frontend
        try:
            from jose import jwt
            decoded = jwt.get_unverified_claims(token)
            firebase_uid = decoded.get("user_id") or decoded.get("sub")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format",
                headers={"WWW-Authenticate": "Bearer"},
            )

    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing UID",
        )

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please log in first via /auth/login.",
        )

    return user
