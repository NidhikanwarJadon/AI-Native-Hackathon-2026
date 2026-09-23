# corrective-rizz backend

FastAPI + SQLAlchemy + PostgreSQL + Alembic, JWT auth. All API routes are under `/api`.

## Prerequisites

- Python 3.10, PostgreSQL running locally
- A database (currently `corrective-rizz-1`) reachable with the credentials in `.env`

## Setup

```bash
cd backend
python3 -m venv venv                      # only if venv/ is missing
venv/bin/pip install -r requirements.txt
```

Configuration lives in `backend/.env` (gitignored). It must define `DATABASE_URL` and
`SECRET_KEY`; `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` and `RESET_TOKEN_EXPIRE_MINUTES`
have defaults in `app/core/config.py`.

## Database migrations

```bash
venv/bin/alembic upgrade head      # apply migrations
venv/bin/alembic check             # is the schema in sync with the models?
venv/bin/alembic current           # which revision is applied
```

After adding or changing a model, generate a migration, **read it**, then apply:

```bash
venv/bin/alembic revision --autogenerate -m "what changed"
venv/bin/alembic upgrade head
```

New models must be re-exported from `app/models/__init__.py`, or autogenerate cannot
see them.

## Run

```bash
venv/bin/uvicorn app.main:app --reload --port 8000
```

- Swagger UI: http://localhost:8000/docs  (click **Authorize** and paste a login token)
- OpenAPI JSON: http://localhost:8000/openapi.json
- `GET /` serves the frontend build from `../frontend/dist` when it exists, else 404.

## Test

```bash
venv/bin/pytest -q          # full suite
venv/bin/pytest -v          # per-test names
```

Tests run against the database in `DATABASE_URL` — there is no separate test database.
They only touch addresses matching `test-%@example.com` and delete them afterwards.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Exchange email+password for a bearer token |
| POST | `/api/auth/forgot-password` | — | Request a reset link (always 202) |
| POST | `/api/auth/reset-password` | — | Redeem a reset token, set a new password |
| GET | `/api/users/me` | Bearer | Profile of the caller |
| POST | `/api/users` | Bearer | Create a user as an authenticated caller |
| PATCH | `/api/users/{id}` | Bearer | Update yourself |
| DELETE | `/api/users/{id}` | Bearer | Delete yourself |

## Manual API walkthrough

```bash
BASE=http://localhost:8000
J='Content-Type: application/json'

curl -s -X POST $BASE/api/auth/register -H "$J" \
  -d '{"email":"demo@example.com","password":"hunter2hunter2","full_name":"Demo"}'

TOKEN=$(curl -s -X POST $BASE/api/auth/login -H "$J" \
  -d '{"email":"demo@example.com","password":"hunter2hunter2"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')

curl -s $BASE/api/users/me -H "Authorization: Bearer $TOKEN"
curl -s -X PATCH $BASE/api/users/1 -H "$J" -H "Authorization: Bearer $TOKEN" \
  -d '{"full_name":"Renamed"}'
```

### Password reset

Email is **not wired up** — `_send_password_reset_email` in `app/routers/auth.py` logs the
token instead of sending it (`TODO(human): wire real SMTP`). To test the flow, request a
reset and copy the token from the server log:

```bash
curl -s -X POST $BASE/api/auth/forgot-password -H "$J" -d '{"email":"demo@example.com"}'
# server log: "EMAIL NOT SENT ... Reset token (valid 30 minutes): <token>"
curl -s -X POST $BASE/api/auth/reset-password -H "$J" \
  -d '{"token":"<token>","new_password":"brandnewpass1"}'
```

Reset tokens are single-use: they carry a fingerprint of the password hash, so changing
the password invalidates them. They are also typed, so a reset token cannot be used as a
login token and vice versa.

## Known gaps

- SMTP is stubbed; reset tokens are only logged.
- `is_verified` is never set true — there is no email-verification flow yet.
- No `/health` endpoint, no rate limiting on login or forgot-password.
- Update and delete are self-only; there is no role column and so no admin path.
