# AI Evidence Log

Append-only. Shared by the whole team — no single owner. Add an entry every time an agent or skill produces something useful. This is raw material for the demo story (`demo-script.md`) and the traditional-vs-AI comparison (`ai-approach.md`) — capture it as it happens, not at 6:00 PM from memory.

| Time | Stage | Agent/Skill | What It Produced | Accepted As-Is? |
|---|---|---|---|---|
| | | | | |
| 12:15 | Build (backend) | `backend-engineer` / `fastapi-development` | User model + schemas + CRUD + `get_current_user` + auth and users routers, wired into `main.py`; `.env` email block; `requirements.txt` populated | Yes — DB-touching paths unverified (no Postgres role) |

## Backend scope — 2026-09-23

Delivered by `backend-engineer` following the `fastapi-development` skill. Built with **no API
contract in `docs/architecture.md`** (still a placeholder) on explicit human instruction to treat
the task prompt as the spec — every assumption below is therefore mine, not the architect's, and
needs confirming before `frontend-engineer` relies on it.

### Endpoints now live

All routes are registered in `backend/app/main.py` and carry their own `/api` prefix.

| Method | Path | Request body | Success response | Auth |
|---|---|---|---|---|
| POST | `/api/auth/register` | `UserCreate` — `{email, password, full_name?}` | 201 `UserOut` | No |
| POST | `/api/auth/login` | `UserLogin` — `{email, password}` | 200 `Token` — `{access_token, token_type}` | No |
| POST | `/api/auth/forgot-password` | `{email}` | 202 `{message}` (identical whether or not the email exists) | No |
| GET | `/api/users/me` | — | 200 `UserOut` | Bearer JWT |
| POST | `/api/users` | `UserCreate` | 201 `UserOut` | Bearer JWT |
| PATCH | `/api/users/{user_id}` | `UserUpdate` — all fields optional: `{email?, password?, full_name?, is_active?}` | 200 `UserOut` | Bearer JWT |
| DELETE | `/api/users/{user_id}` | — | 204 no body | Bearer JWT |

`UserOut` = `{id, email, full_name, is_active, is_verified, created_at, updated_at}` — no password
or hash field anywhere. Failure codes: 401 (missing/invalid token, bad login), 403 (inactive
account, acting on another user), 404 (unknown user), 409 (email already registered), 422
(validation).

### Files

Created: `app/dependencies.py`, `app/routers/users.py`.
Filled in (were empty or one-line placeholders): `app/models/user_model.py`,
`app/schemas/user_schema.py`, `app/crud/user_crud.py`, `app/routers/auth.py`, `app/main.py`,
`requirements.txt`.
Edited: `alembic/env.py` (model import per its TODO), `.env` (appended commented-out SMTP block;
existing TODOs untouched).
Not touched: `core/config.py`, `core/database.py`, `core/security.py`, `alembic.ini`.

### Migrations

**None. `alembic/versions/` is still empty and nothing was applied.** `alembic revision
--autogenerate` was attempted and failed at connect time (`FATAL: password authentication failed
for user "TODO_USER"`) — autogenerate needs a live database. `Base.metadata` was confirmed to hold
the `users` table with a unique index `ix_users_email`, so autogenerate will produce the right
migration as soon as a real `DATABASE_URL` exists. No `Base.metadata.create_all` anywhere.

### Verified (running server + curl)

App boots with no database and with no frontend build; `/docs` 200; `/openapi.json` lists all
seven routes; 422 on every malformed body (missing fields, bad email, <8-char and >72-char
password); 401 on all four protected routes with no token, a garbage token, and a wrong auth
scheme; no `password`/`hashed_password` property in any response schema. Server stopped, port 8000
free.

### NOT verified — blocked on the database

`backend/.env` still holds the placeholder `DATABASE_URL` and the OS user has no Postgres role.
Every DB-touching path returns **HTTP 500** with
`sqlalchemy.exc.OperationalError: FATAL: password authentication failed for user "TODO_USER"`:
register, login, forgot-password with a real email, and any protected route with a *valid* token.
So: happy paths, 409 duplicate-email, 403 inactive/other-user, 404, and the forgot-password token
mint are all unverified. No credentials were invented and there is no SQLite fallback.

### Assumptions (no contract existed)

1. Login takes **JSON** `{email, password}`, not OAuth2 form data; `get_current_user` uses
   `HTTPBearer(auto_error=False)` so a missing header is 401, not FastAPI's default 403.
2. `Token` is `{access_token, token_type}` only — the frontend calls `/api/users/me` for the user.
3. Update/delete are restricted to the caller's own record; there is no role/superuser column, so
   there is currently **no admin path** to manage other users.
4. `POST /api/users` (authenticated) coexists with `/api/auth/register` (open) because the prompt
   asked for both; any authenticated user can create accounts.
5. The reset token is a short-lived (30 min) JWT from the existing `create_access_token`, so it is
   **structurally identical to an access token** — a leaked reset link is a valid login. A distinct
   token type or a single-use DB-backed token is needed before production.
6. Email delivery is stubbed and logs the token at WARNING (`# TODO(human): wire real SMTP`).
7. No password-reset *confirm* endpoint was built — it was outside the stated scope.
8. Static mount expects a build at `frontend/dist`, guarded so a missing directory cannot stop boot.
9. No new dependencies. `requirements.txt` is a straight `venv/bin/pip freeze` (42 packages).

### Flagged for review

FastAPI's default 422 body echoes the submitted password back under `input`. Suppressing it needs a
custom validation handler — a global behaviour change, so not done unilaterally.
