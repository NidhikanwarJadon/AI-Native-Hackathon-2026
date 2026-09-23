"""User management endpoints - profile, create, update, delete. All JWT-protected."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud import user_query
from app.crud.user_query import EmailAlreadyExistsError
from app.dependencies import get_current_user
from app.db.user_model import User
from app.schemas.user_schema import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


def _require_self(current_user: User, user_id: int) -> None:
    """There is no role column yet, so a user may only act on their own record."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not permitted to act on another user",
        )


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserOut:
    """Return the profile of the authenticated caller."""
    return current_user


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserOut:
    """Create a user as an authenticated caller. 409 if the email is taken.

    Self-service signup is POST /api/auth/register; this one needs a token.
    """
    if user_query.get_user_by_email(db, user_in.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    try:
        return user_query.create_user(db, user_in)
    except EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserOut:
    """Partially update a user. Callers may only update themselves."""
    _require_self(current_user, user_id)

    user = user_query.get_user(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if user_in.email is not None and user_in.email != user.email:
        if user_query.get_user_by_email(db, user_in.email) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

    # Callers may only update themselves, so allowing is_active=false here would
    # let someone lock themselves out permanently: every later request is refused
    # by get_current_user, including the one that would undo it.
    if user_in.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account",
        )

    try:
        return user_query.update_user(db, user, user_in)
    except EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )


# response_model=None is explicit: 204 carries no body, so there is nothing to shape.
@router.delete(
    "/{user_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Delete a user. Callers may only delete themselves. 204 with no body."""
    _require_self(current_user, user_id)

    user = user_query.get_user(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user_query.delete_user(db, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
