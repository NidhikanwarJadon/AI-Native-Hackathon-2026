"""SQLAlchemy engine, session factory, declarative Base, and the get_db dependency.

Route handlers never construct a session themselves - they take
`db: Session = Depends(get_db)` so each request gets its own session and
teardown is guaranteed.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.db.session import settings

# pool_pre_ping avoids handing out connections the database has already dropped,
# which otherwise shows up as a random failure after an idle period.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    """Declarative base every model in app/models/ inherits from.

    Alembic autogenerate compares against Base.metadata, so a model that does not
    inherit from this is invisible to migrations.
    """


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a request-scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
