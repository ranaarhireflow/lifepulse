import os

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

from app.config import settings

_initialized = False


def _init_firebase():
    global _initialized
    if _initialized:
        return

    sa_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
    if os.path.exists(sa_path):
        cred = credentials.Certificate(sa_path)
        firebase_admin.initialize_app(cred)
    elif settings.FIREBASE_PROJECT_ID:
        # Use application default credentials (for cloud environments)
        firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
    else:
        raise RuntimeError("Firebase credentials not configured")

    _initialized = True


def verify_firebase_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return the decoded claims."""
    _init_firebase()
    decoded = firebase_auth.verify_id_token(id_token, check_revoked=True)
    return decoded
