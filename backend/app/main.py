"""FastAPI entrypoint - app creation, CORS, router registration, static frontend mount."""

import logging
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.db.session import settings
from app.routers import auth, users

logger = logging.getLogger(__name__)

# app/main.py -> app -> backend -> repo root -> frontend/
BACKEND_DIR = Path(__file__).resolve().parents[1]
FRONTEND_BUILD_DIR = BACKEND_DIR.parent / "frontend" / "dist"

app = FastAPI(
    title="corrective-rizz API",
    description="Backend for corrective-rizz. All API routes are prefixed with /api.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Field names whose submitted value must never be echoed back. FastAPI's default
# validation handler includes the offending input in the 422 body, which means a
# rejected password is returned to the caller and written to any access log that
# records response bodies.
SENSITIVE_INPUT_FIELDS = frozenset(
    {"password", "new_password", "current_password", "token", "access_token"}
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return 422 exactly as FastAPI would, minus the value of sensitive fields."""
    errors = []
    for error in exc.errors():
        cleaned = dict(error)
        if any(str(part) in SENSITIVE_INPUT_FIELDS for part in cleaned.get("loc", ())):
            cleaned.pop("input", None)
        cleaned.pop("url", None)
        errors.append(cleaned)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": errors}),
    )


# Routers carry their own /api prefix (see app/routers/*.py).
app.include_router(auth.router)
app.include_router(users.router)
#ADD router registrations here.


# The frontend build is optional: frontend/ is empty during backend development, and
# mounting a missing directory would make StaticFiles raise at import time and stop
# the API booting at all. Guarded, so the API runs with or without a build.
if FRONTEND_BUILD_DIR.is_dir():
    app.mount(
        "/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend"
    )
else:
    logger.info(
        "No frontend build at %s - serving the API only. Build the frontend to "
        "have it served from here.",
        FRONTEND_BUILD_DIR,
    )
