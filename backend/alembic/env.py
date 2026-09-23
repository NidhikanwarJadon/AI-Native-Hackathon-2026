"""Alembic migration environment.

Wired to the application so migrations use one source of truth:
  - the database URL comes from app.core.config.settings.DATABASE_URL (not alembic.ini)
  - autogenerate compares against app.core.database.Base.metadata
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.core.database import Base

# Import every model module here as it is created. A model that is never imported
# is not registered on Base.metadata, and autogenerate will silently emit an empty
# migration - or worse, propose dropping the table.
import app.db  # noqa: F401  - registers every model on Base.metadata

config = context.config

# Feed the application's URL to Alembic, overriding whatever alembic.ini holds.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Emit SQL to stdout without connecting to a database."""
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Connect to the database and run migrations against it."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
