"""Password hashing (passlib + bcrypt) and JWT creation/decoding (PyJWT).

python-jose is also installed but unused - PyJWT is the actively maintained option
and FastAPI's own docs use it. If the team switches, this file is the only one to
change.

Tokens carry a `type` claim ("access" or "reset"). Decoding checks it, so a
password-reset link cannot be replayed as a login token.
"""

import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt import PyJWTError
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# bcrypt hashes at most 72 bytes and raises on anything longer, so registration
# schemas must cap password length rather than relying on silent truncation.
BCRYPT_MAX_PASSWORD_BYTES = 72

TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_RESET = "reset"

# A bcrypt hash of a throwaway value. authenticate_user verifies against this when
# the email is unknown, so a missing account costs the same time as a wrong
# password and the endpoint cannot be used to enumerate registered emails.
DUMMY_PASSWORD_HASH = pwd_context.hash("not-a-real-password")


def hash_password(password: str) -> str:
    """Return a bcrypt hash. Never store or log the plaintext."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Constant-time check of a plaintext password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def password_fingerprint(hashed_password: str) -> str:
    """Short digest of a stored hash, embedded in reset tokens as the `pwf` claim.

    Changing the password changes the hash, which changes this digest, which
    invalidates every reset token issued beforehand. That gives single-use reset
    links without needing a token table.
    """
    return hashlib.sha256(hashed_password.encode("utf-8")).hexdigest()[:16]


def create_access_token(
    subject: str | int,
    expires_delta: timedelta | None = None,
    token_type: str = TOKEN_TYPE_ACCESS,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Sign a JWT whose `sub` claim is the user id, as a string."""
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "type": token_type,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_reset_token(subject: str | int, hashed_password: str) -> str:
    """Sign a short-lived password-reset token bound to the current password hash."""
    return create_access_token(
        subject,
        expires_delta=timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
        token_type=TOKEN_TYPE_RESET,
        extra_claims={"pwf": password_fingerprint(hashed_password)},
    )


def decode_access_token(
    token: str, expected_type: str = TOKEN_TYPE_ACCESS
) -> dict[str, Any] | None:
    """Return the token payload, or None if it is invalid, expired or the wrong type.

    Returning None rather than raising keeps the HTTP concern (401) in the
    dependency layer instead of here.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except PyJWTError:
        return None

    # A token minted for one purpose must not be accepted for another.
    if payload.get("type") != expected_type:
        return None
    return payload
