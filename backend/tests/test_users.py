"""User endpoints: profile, update, delete, and their auth guards."""

import pytest


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer not.a.jwt"},
        {"Authorization": "Basic abc"},
    ],
    ids=["no-header", "garbage-token", "wrong-scheme"],
)
def test_me_requires_a_valid_bearer_token(client, headers):
    assert client.get("/api/users/me", headers=headers).status_code == 401


def test_me_returns_the_caller(client, registered):
    r = client.get("/api/users/me", headers=registered["headers"])
    assert r.status_code == 200
    assert r.json()["email"] == registered["email"]


def test_user_can_update_own_profile(client, registered):
    r = client.patch(
        f"/api/users/{registered['id']}",
        headers=registered["headers"],
        json={"full_name": "Renamed"},
    )
    assert r.status_code == 200
    assert r.json()["full_name"] == "Renamed"


def test_user_cannot_update_someone_else(client, registered):
    r = client.patch(
        f"/api/users/{registered['id'] + 99999}",
        headers=registered["headers"],
        json={"full_name": "Nope"},
    )
    assert r.status_code == 403


def test_user_cannot_deactivate_themselves(client, registered):
    """Self-deactivation would be a permanent lockout, so it is refused."""
    r = client.patch(
        f"/api/users/{registered['id']}",
        headers=registered["headers"],
        json={"is_active": False},
    )
    assert r.status_code == 400


def test_delete_self_then_token_stops_working(client, registered):
    assert (
        client.delete(
            f"/api/users/{registered['id']}", headers=registered["headers"]
        ).status_code
        == 204
    )
    assert client.get("/api/users/me", headers=registered["headers"]).status_code == 401
