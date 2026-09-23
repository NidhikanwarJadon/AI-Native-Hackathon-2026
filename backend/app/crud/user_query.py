"""CRUD operations for User - all database access for the user resource lives here.

Routers never query the session directly; they call these functions.
"""

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    DUMMY_PASSWORD_HASH,
    hash_password,
    verify_password,
)
from app.db.user_model import User
from app.schemas.user_schema import UserCreate, UserUpdate


class EmailAlreadyExistsError(Exception):
    """Raised when a write would violate the unique constraint on users.email.

    The routers turn this into a 409. It exists because a check-then-insert is a
    race: two concurrent registrations both pass the "is this email free?" check
    and only the database can arbitrate. Catching the IntegrityError here means
    the loser gets a 409 rather than a 500.
    """


def get_user(db: Session, user_id: int) -> User | None:
    """Fetch one user by primary key, or None."""
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> User | None:
    """Fetch one user by email, case-insensitively, or None."""
    normalised = email.strip().lower()
    stmt = select(User).where(func.lower(User.email) == normalised)
    return db.execute(stmt).scalar_one_or_none()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """List users, oldest first. Paged so a large table cannot be pulled in one go."""
    stmt = select(User).order_by(User.id).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


def create_user(db: Session, user_in: UserCreate) -> User:
    """Insert a user, hashing the password on the way in. Plaintext is never stored."""
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise EmailAlreadyExistsError(str(exc)) from exc
    db.refresh(user)
    return user


def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    """Apply a partial update. `password` is re-hashed; unset fields are left alone."""
    data = user_in.model_dump(exclude_unset=True)

    password = data.pop("password", None)
    if password is not None:
        user.hashed_password = hash_password(password)

    for field, value in data.items():
        setattr(user, field, value)

    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise EmailAlreadyExistsError(str(exc)) from exc
    db.refresh(user)
    return user


def set_password(db: Session, user: User, new_password: str) -> User:
    """Replace a user's password. Used by the password-reset flow.

    Changing the hash also invalidates every outstanding reset token for this
    user, because those tokens carry a fingerprint of the previous hash.
    """
    user.hashed_password = hash_password(new_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    """Hard-delete a user row."""
    db.delete(user)
    db.commit()


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Return the user when email + password match, otherwise None.

    When the email is unknown, the password is still verified against a dummy
    hash. Both branches therefore cost one bcrypt verification, so response time
    does not reveal whether an account exists.
    """
    user = get_user_by_email(db, email)
    if user is None:
        verify_password(password, DUMMY_PASSWORD_HASH)
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
