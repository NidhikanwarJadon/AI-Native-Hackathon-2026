---
name: fastapi-development
description: "Backend conventions for corrective-rizz - FastAPI project layout, router/crud layering, session injection, schema separation, auth dependencies, Alembic migrations, and endpoint verification. Invoke before implementing or modifying anything under backend/."
---

# FastAPI development conventions (corrective-rizz)

Reads `docs/architecture.md` for the data model and API contract. Writes code under `backend/`.

These are project-wide conventions, not feature instructions. Follow them as written. If a
situation isn't covered here, ask — don't invent a local convention.

## Folder structure

Everything lives under `backend/`:

| Path | Holds |
|---|---|
| `backend/app/main.py` | FastAPI entrypoint — router registration, CORS, static frontend mount |
| `backend/app/core/config.py` | Pydantic Settings — env vars (`DATABASE_URL`, `SECRET_KEY`, ...) |
| `backend/app/core/security.py` | Password hashing, JWT create/decode |
| `backend/app/core/database.py` | Engine, `SessionLocal`, `Base`, `get_db` |
| `backend/app/models/` | SQLAlchemy models — one file per resource |
| `backend/app/schemas/` | Pydantic schemas — one file per resource, mirroring `models/` |
| `backend/app/crud/` | Database operations — one file per resource |
| `backend/app/routers/` | API endpoints — one file per feature, all prefixed `/api` |
| `backend/app/dependencies.py` | Shared dependencies such as `get_current_user` |
| `backend/alembic/` | Migrations |

### Adding a resource

A resource named `foo` means four files, created together:

```
backend/app/models/foo_model.py      -> Foo
backend/app/schemas/foo_schema.py    -> FooCreate, FooUpdate, FooOut
backend/app/crud/foo_crud.py         -> get_foo, get_foos, create_foo, update_foo, delete_foo
backend/app/routers/<feature>.py     -> router = APIRouter(prefix="/api/foos", tags=["foos"])
```

Models, schemas and crud files are named after the **resource** and carry a `_model`,
`_schema` or `_crud` suffix.

**Routers are named after the feature or domain, with no suffix** — `auth.py`, `health.py`,
`foos.py`. The reason: one router commonly serves several related resources (`auth.py` covers
login, signup and token refresh across users and sessions), so a resource-suffixed name would
be wrong the moment the second endpoint lands. Do not "correct" router filenames to a
`_router.py` pattern to match the other three directories — the asymmetry is deliberate.

Register the router in `backend/app/main.py`:

```python
app.include_router(auth.router)
```

Build in dependency order — model → schema → crud → router — each layer using only the one
below it. A resource missing any of the four files is not done.

## Layering

**Routers never touch the database.** No `session.query(...)`, no `select(...)`, no raw SQL in
a router. Routers validate input, call one or more `crud/` functions, and shape the response.
All query logic lives in `crud/`. This is what keeps endpoints testable and query logic
reusable across routes.

**Sessions are always injected**, never constructed inside a handler:

```python
# correct
@router.get("/{foo_id}", response_model=FooOut)
def read_foo(foo_id: int, db: Session = Depends(get_db)):
    return crud.get_foo(db, foo_id)

# wrong - hardcoded session, leaks, untestable, no per-request teardown
@router.get("/{foo_id}")
def read_foo(foo_id: int):
    db = SessionLocal()
    ...
```

`get_db` comes from `app.core.database`.

## Schemas: separate input from output

Input and output schemas are always distinct types, even when the fields look similar today.

```python
class UserCreate(BaseModel):   # in  - accepts password
    email: EmailStr
    password: str

class UserLogin(BaseModel):    # in  - accepts password
    email: EmailStr
    password: str

class UserOut(BaseModel):      # out - NO password, NO hashed_password
    id: int
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)
```

A password or password hash must never appear in a response schema. Never return a SQLAlchemy
model directly where an output schema is expected — `response_model` is the enforcement point.

## Auth

Protected routes take the shared dependency:

```python
@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
```

`get_current_user` lives in `backend/app/dependencies.py`. Never reimplement token decoding,
credential parsing, or user lookup inside an individual route — one implementation means one
place to fix when the auth flow changes.

## Database and migrations

`DATABASE_URL` always comes from the settings object in `backend/app/core/config.py`. Never
hardcode a connection string, never read `os.environ` directly in application code, and never
fall back to SQLite — this project is PostgreSQL only, including for local development and
quick experiments.

Every model change requires a migration:

```bash
alembic revision --autogenerate -m "add foo table"
```

**Show the generated migration and get it reviewed before running `alembic upgrade head`.**
Autogenerate misreads renames as drop-plus-create often enough that applying it unread risks
data loss.

Never use `Base.metadata.create_all()`. This project uses Alembic exclusively; mixing the two
leaves the migration history out of step with the real schema.

## Route requirements

Every route declares `response_model`. It enforces the output contract, strips fields the
schema doesn't list, and keeps `/docs` accurate:

```python
@router.post("/", response_model=FooOut, status_code=201)
```

## File docstrings

Every file opens with a one- or two-line docstring saying what it holds:

```python
"""CRUD operations for Foo - all database access for the foo resource lives here."""
```

Teammates navigate by these during a hackathon; a file without one costs someone a read.

## Verification — required before calling work done

After adding or changing an endpoint, run it:

```bash
cd backend && venv/bin/uvicorn app.main:app --reload --port 8000
```

Then exercise it with `curl`, checking status code and response body:

```bash
# happy path
curl -i -X POST localhost:8000/api/foos -H 'Content-Type: application/json' -d '{"name":"x"}'

# failure paths - always test at least one
curl -i -X POST localhost:8000/api/foos -H 'Content-Type: application/json' -d '{}'
curl -i localhost:8000/api/foos/me            # no token -> expect 401
```

Confirm no password or hash appears in any response body.

Never report an endpoint as working because the code looks right. If you couldn't run it —
no database, migration unapplied, missing env var — say exactly that and name what is still
unverified.
