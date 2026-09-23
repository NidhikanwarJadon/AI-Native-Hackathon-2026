"""Application settings - every environment-driven value the backend reads lives here.

Nothing else in the codebase may read os.environ directly or hardcode a connection
string; import `settings` from this module instead.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# app/core/config.py -> app/core -> app -> backend/
BACKEND_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """Values loaded from backend/.env (or the real environment, which wins)."""

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Required - no default on purpose. PostgreSQL only; there is deliberately no
    # SQLite fallback, so a missing value fails loudly at startup instead of
    # silently running against the wrong database.
    DATABASE_URL: str
    SECRET_KEY: str

    # Safe to default.
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Password-reset links must die faster than an access token.
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # TODO(you): CORS origins for the React dev server. Add or remove ports to
    # match how the frontend is actually served. Override in .env as a JSON list,
    # e.g. CORS_ORIGINS=["http://localhost:5173"]
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


@lru_cache
def get_settings() -> Settings:
    """Cached accessor - the .env file is read once per process."""
    return Settings()


settings = get_settings()
