"""Auth flow: register, login, forgot-password, reset-password."""


def test_register_returns_user_without_password(client, unique_email):
    r = client.post(
        "/api/auth/register",
        json={"email": unique_email, "password": "hunter2hunter2"},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == unique_email
    assert "password" not in body and "hashed_password" not in body


def test_duplicate_email_is_conflict(client, registered):
    r = client.post(
        "/api/auth/register",
        json={"email": registered["email"], "password": "hunter2hunter2"},
    )
    assert r.status_code == 409


def test_email_is_case_insensitive(client, registered):
    """Registering and logging in must not depend on capitalisation."""
    r = client.post(
        "/api/auth/register",
        json={"email": registered["email"].upper(), "password": "hunter2hunter2"},
    )
    assert r.status_code == 409

    r = client.post(
        "/api/auth/login",
        json={"email": registered["email"].upper(), "password": registered["password"]},
    )
    assert r.status_code == 200


def test_login_with_wrong_password_is_unauthorised(client, registered):
    r = client.post(
        "/api/auth/login",
        json={"email": registered["email"], "password": "wrongwrongwrong"},
    )
    assert r.status_code == 401


def test_validation_error_does_not_echo_the_password(client, unique_email):
    """A rejected password must not come back in the 422 body.

    The secret is distinctive so a match cannot come from an error type name such
    as "string_too_short".
    """
    secret = "Tr0ub4dor"[:6]  # too short to pass, unlikely to appear in any message
    r = client.post(
        "/api/auth/register", json={"email": unique_email, "password": secret}
    )
    assert r.status_code == 422
    assert secret not in r.text

    password_errors = [e for e in r.json()["detail"] if "password" in e["loc"]]
    assert password_errors, "expected a validation error on the password field"
    assert all("input" not in e for e in password_errors)


def test_forgot_password_does_not_reveal_whether_account_exists(client, registered):
    known = client.post(
        "/api/auth/forgot-password", json={"email": registered["email"]}
    )
    unknown = client.post(
        "/api/auth/forgot-password", json={"email": "no-such-user@example.com"}
    )
    assert known.status_code == unknown.status_code == 202
    assert known.json() == unknown.json()


def test_access_token_is_rejected_by_reset_password(client, registered):
    """A login token must not double as a password-reset token."""
    r = client.post(
        "/api/auth/reset-password",
        json={"token": registered["token"], "new_password": "brandnewpass1"},
    )
    assert r.status_code == 400
