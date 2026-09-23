"""SQLAlchemy models - one module per resource, named <resource>_model.py.

Every model is re-exported here so that importing `app.models` registers all of
them on `Base.metadata`. Alembic autogenerate compares against that metadata, so a
model missing from this list is invisible to migrations and can be silently
dropped. Add new models to both the import and __all__ below.
"""

from app.db.user_model import User

__all__ = ["User"]
