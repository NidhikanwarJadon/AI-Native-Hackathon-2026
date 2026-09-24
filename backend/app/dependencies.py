"""Shared FastAPI dependencies - the single implementation of "who is calling?".

Protected routes take `current_user: User = Depends(get_current_user)`. Token
decoding and user lookup are never repeated inside an individual route.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.crud import user_query
from app.db.user_model import User

# auto_error=False so a missing Authorization header reaches us and becomes a 401
# (HTTPBearer's own default raises 403, which is the wrong answer for "no token").
bearer_scheme = HTTPBearer(auto_error=False, description="Paste the login access_token")

_CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the bearer token to a User, or raise 401 / 403.

    401: header missing, scheme wrong, token invalid or expired, user gone.
    403: the token is valid but the account has been deactivated.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _CREDENTIALS_ERROR

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise _CREDENTIALS_ERROR

    subject = payload.get("sub")
    if subject is None:
        raise _CREDENTIALS_ERROR

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise _CREDENTIALS_ERROR

    user = user_query.get_user(db, user_id)
    if user is None:
        raise _CREDENTIALS_ERROR

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )

    return user
