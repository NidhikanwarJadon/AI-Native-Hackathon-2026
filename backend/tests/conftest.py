"""Shared pytest fixtures.

These tests run against the real database in DATABASE_URL - there is no separate
test database - so every fixture cleans up the rows it creates.
"""

import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.main import app
from app.models.user_model import User


@pytest.fixture()
def client() -> TestClient:
    """A TestClient bound to the real app."""
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def unique_email() -> str:
    """A fresh address per test, so runs never collide with leftovers."""
    return f"test-{uuid.uuid4().hex[:12]}@example.com"


@pytest.fixture(autouse=True)
def _cleanup_test_users():
    """Delete anything this suite created, pass or fail."""
    yield
    db = SessionLocal()
    try:
        db.query(User).filter(User.email.like("test-%@example.com")).delete(
            synchronize_session=False
        )
        db.commit()
    finally:
        db.close()


@pytest.fixture()
def registered(client: TestClient, unique_email: str) -> dict:
    """A registered, logged-in user: returns id, email, password and token."""
    password = "hunter2hunter2"
    r = client.post(
        "/api/auth/register",
        json={"email": unique_email, "password": password, "full_name": "Test User"},
    )
    assert r.status_code == 201, r.text
    user_id = r.json()["id"]

    r = client.post(
        "/api/auth/login", json={"email": unique_email, "password": password}
    )
    assert r.status_code == 200, r.text
    return {
        "id": user_id,
        "email": unique_email,
        "password": password,
        "token": r.json()["access_token"],
        "headers": {"Authorization": f"Bearer {r.json()['access_token']}"},
    }
