"""Pydantic schemas for the User resource - request bodies in, response bodies out.

Input and output types are deliberately separate: no schema below that is used as a
`response_model` carries `password` or `hashed_password`.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.security import BCRYPT_MAX_PASSWORD_BYTES

MIN_PASSWORD_LENGTH = 8


def _normalise_email(value: str) -> str:
    """Emails are case-insensitive in practice, so store and match them lowercased.

    Without this, Demo@x.com and demo@x.com register as two accounts and a user
    who capitalises their email at login is told the password is wrong.
    """
    return value.strip().lower()


def _check_password_bytes(value: str) -> str:
    """bcrypt raises above 72 *bytes*, and non-ASCII chars cost more than one byte."""
    if len(value.encode("utf-8")) > BCRYPT_MAX_PASSWORD_BYTES:
        raise ValueError(
            f"password must be at most {BCRYPT_MAX_PASSWORD_BYTES} bytes when "
            "UTF-8 encoded"
        )
    return value


# --------------------------------------------------------------------------- in


class UserCreate(BaseModel):
    """Registration / user-creation payload."""

    email: EmailStr
    password: str = Field(
        min_length=MIN_PASSWORD_LENGTH, max_length=BCRYPT_MAX_PASSWORD_BYTES
    )
    full_name: str | None = Field(default=None, max_length=255)

    @field_validator("password")
    @classmethod
    def _validate_password(cls, value: str) -> str:
        return _check_password_bytes(value)

    @field_validator("email")
    @classmethod
    def _normalise_email(cls, value: str) -> str:
        return _normalise_email(value)


class UserLogin(BaseModel):
    """Login payload - email + password, exchanged for an access token."""

    email: EmailStr
    password: str = Field(min_length=1)

    @field_validator("email")
    @classmethod
    def _normalise_email(cls, value: str) -> str:
        return _normalise_email(value)


class UserUpdate(BaseModel):
    """Partial update. Every field is optional; omitted fields are left untouched."""

    email: EmailStr | None = None
    password: str | None = Field(
        default=None,
        min_length=MIN_PASSWORD_LENGTH,
        max_length=BCRYPT_MAX_PASSWORD_BYTES,
    )
    full_name: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None

    @field_validator("password")
    @classmethod
    def _validate_password(cls, value: str | None) -> str | None:
        return None if value is None else _check_password_bytes(value)

    @field_validator("email")
    @classmethod
    def _normalise_email(cls, value: str | None) -> str | None:
        return None if value is None else _normalise_email(value)


class ForgotPasswordRequest(BaseModel):
    """Start a password reset. Responds identically whether or not the email exists."""

    email: EmailStr

    @field_validator("email")
    @classmethod
    def _normalise_email(cls, value: str) -> str:
        return _normalise_email(value)


class ResetPasswordRequest(BaseModel):
    """Redeem a reset token from the forgot-password email and set a new password."""

    token: str = Field(min_length=1)
    new_password: str = Field(
        min_length=MIN_PASSWORD_LENGTH, max_length=BCRYPT_MAX_PASSWORD_BYTES
    )

    @field_validator("new_password")
    @classmethod
    def _validate_password(cls, value: str) -> str:
        return _check_password_bytes(value)


# -------------------------------------------------------------------------- out


class UserOut(BaseModel):
    """Public view of a user. Contains no password and no hash."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str | None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class Token(BaseModel):
    """Bearer token returned by login; send it as `Authorization: Bearer <token>`."""

    access_token: str
    token_type: str = "bearer"


class MessageOut(BaseModel):
    """Generic acknowledgement for endpoints with nothing else to return."""

    message: str
