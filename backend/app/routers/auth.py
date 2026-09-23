"""Authentication endpoints - register, login, forgot-password, reset-password.

Named by feature, not by resource: this router spans registration, token issue and
password recovery rather than mapping one-to-one onto the user table.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    TOKEN_TYPE_RESET,
    create_access_token,
    create_reset_token,
    decode_access_token,
    password_fingerprint,
)
from app.crud import user_query
from app.crud.user_query import EmailAlreadyExistsError

from app.db.session import settings
from app.schemas.user_schema import (
    ForgotPasswordRequest,
    MessageOut,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserOut,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Identical response for every forgot-password call - revealing "no such account"
# turns this endpoint into an account-enumeration oracle.
_FORGOT_PASSWORD_MESSAGE = (
    "If an account exists for that email address, a password reset link has been sent."
)

_INVALID_RESET_TOKEN = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="This password reset link is invalid or has expired",
)


def _send_password_reset_email(email: str, reset_token: str) -> None:
    """Deliver the reset link. Currently a stub that logs instead of sending.

    TODO(human): wire real SMTP. Host, port, user, password and from-address are
    the commented-out EMAIL_* block in backend/.env; nothing here sends mail until
    those are filled in and this function is replaced.
    """
    logger.warning(
        "EMAIL NOT SENT (SMTP not configured): password reset requested for %s. "
        "Reset token (valid %s minutes): %s",
        email,
        settings.RESET_TOKEN_EXPIRE_MINUTES,
        reset_token,
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> UserOut:
    """Create an account. 409 if the email is already registered."""
    if user_query.get_user_by_email(db, user_in.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    try:
        return user_query.create_user(db, user_in)
    except EmailAlreadyExistsError:
        # Lost a race against a concurrent registration for the same email.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)) -> Token:
    """Exchange email + password for a bearer access token.

    401 on bad credentials (the message does not say which half was wrong),
    403 when the account exists but has been deactivated.
    """
    user = user_query.authenticate_user(db, credentials.email, credentials.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )
    return Token(access_token=create_access_token(user.id))


@router.post(
    "/forgot-password",
    response_model=MessageOut,
    status_code=status.HTTP_202_ACCEPTED,
)
def forgot_password(
    payload: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> MessageOut:
    """Start a password reset. Always returns the same message and status.

    A token is only minted when the account exists, but the caller cannot tell:
    the response body, status code and shape are identical either way.
    """
    user = user_query.get_user_by_email(db, payload.email)
    if user is not None:
        reset_token = create_reset_token(user.id, user.hashed_password)
        _send_password_reset_email(user.email, reset_token)

    return MessageOut(message=_FORGOT_PASSWORD_MESSAGE)


@router.post("/reset-password", response_model=MessageOut)
def reset_password(
    payload: ResetPasswordRequest, db: Session = Depends(get_db)
) -> MessageOut:
    """Redeem a reset token and set a new password.

    The token must be of type "reset" - an access token is rejected here - and it
    carries a fingerprint of the password hash it was issued against, so it stops
    working the moment the password changes. That makes reset links single-use.
    """
    claims = decode_access_token(payload.token, expected_type=TOKEN_TYPE_RESET)
    if claims is None:
        raise _INVALID_RESET_TOKEN

    subject = claims.get("sub")
    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise _INVALID_RESET_TOKEN

    user = user_query.get_user(db, user_id)
    if user is None or not user.is_active:
        raise _INVALID_RESET_TOKEN

    if claims.get("pwf") != password_fingerprint(user.hashed_password):
        # Already redeemed, or the password changed by another route since issue.
        raise _INVALID_RESET_TOKEN

    user_query.set_password(db, user, payload.new_password)
    return MessageOut(message="Your password has been reset. Please log in again.")
