---
name: architecture-design
description: How to turn validated hackathon requirements (docs/problem.md) into docs/architecture.md for a React + TypeScript + Vite frontend and FastAPI backend — components, FE/BE boundary, data model, a precise API contract both sides can build against in parallel, key workflows, a Must-have / If-time-permits scope cut, and technical risks. Use when designing or revising the architecture, re-cutting scope mid-build, or resolving a FE/BE contract mismatch. Backs the solution-architect agent.
---

# Architecture Design

Method and template for producing `docs/architecture.md`. The output is a **contract**, not an essay: `frontend-engineer` and `backend-engineer` will build against it in parallel and never read each other's code.

- **Input:** `docs/problem.md` (validated requirements + acceptance criteria).
- **Output:** `docs/architecture.md`, using [template.md](template.md).

## Fixed stack (don't re-decide this)

The repo skeleton already commits to this. Design within it.

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite, client-side routing |
| Backend | Python, FastAPI, Pydantic v2 schemas |
| Persistence | SQLAlchemy ORM + Alembic migrations; `DATABASE_URL` from Pydantic Settings (SQLite is fine for the demo unless requirements say otherwise) |
| Auth (only if a Must-have needs it) | JWT bearer tokens, bcrypt password hashing (`app/core/security.py`) |
| Backend layout | `app/routers/` (HTTP) → `app/crud/` (data access / business logic) → `app/models/` (SQLAlchemy) with `app/schemas/` (Pydantic request/response) |
| Serving | Backend serves the built frontend (static mount + catch-all route); in dev, Vite proxies `/api` to FastAPI |

All API routes live under `/api`. Never introduce new infrastructure (Redis, queues, separate services, Docker orchestration) for a one-day prototype unless a Must-have acceptance criterion is impossible without it.

## Steps

### 1. Extract the critical user journey
From `docs/problem.md`, write the one journey the demo must complete end-to-end:
`Entry → Main screen → Primary action → Processing → Result → Value shown`.
Every later decision is judged by "does this serve the journey?"

List the Must-have requirement / acceptance-criterion IDs that the journey covers. Anything not on this path is a candidate for If-time-permits.

### 2. Components and boundaries
- Name each component (FE pages, BE routers/services, any external API/LLM).
- One diagram (ASCII or Mermaid) showing FE ↔ BE ↔ DB ↔ external.
- State the boundary rule explicitly: the frontend knows only the endpoints in §API Contract; the backend knows nothing about screens.
- If there's an AI/LLM or third-party call, isolate it behind one backend service with a **mock mode** switch (env var) so the demo survives an outage or rate limit.

### 3. Data model
- Only entities the Must-have journey touches. Target ≤ 5 entities.
- For each: fields, type, required/optional, constraints, relationships.
- Include **seed data** needs — what must exist in the DB for the demo to run from a fresh start. Functional team members will supply realistic values.

### 4. API contract (the most important section)
For every endpoint, specify all of:

- Method + path (under `/api`), purpose, traced requirement ID(s)
- Auth required? (yes/no)
- Path/query params with types
- Request body — JSON example **and** field table (name, type, required, constraints)
- Success response — status code, JSON example, field table
- Error responses — status codes and when they happen

Rules:
- **One error envelope** for every error: `{"detail": "<human-readable message>", "code": "<MACHINE_CODE>"}`. FastAPI validation errors (422) keep FastAPI's default shape — say so.
- **snake_case** JSON keys on the wire. The frontend maps to its own types; don't make the backend camelCase.
- IDs are integers unless there's a reason; timestamps are ISO-8601 UTC strings.
- Lists return `{"items": [...], "total": n}` — never a bare array — so pagination can be added without breaking the contract.
- Provide a **TypeScript interface block** and matching **Pydantic model names** for each request/response so both sides type from the same source.
- Include `GET /api/health` → `{"status": "ok"}` so the 1:00 PM checkpoint can verify FE ↔ BE connectivity.
- Keep the endpoint count small. For a one-day MVP, 4–8 endpoints is typical; more than ~10 is a smell.

### 5. Frontend structure
- Routes/pages mapped to journey steps.
- Key components per page (names only, plus props where they cross a boundary).
- State approach: local state + a thin `api/` client module by default; no global state library unless justified.
- Loading, empty, and error states for each API call on the critical path — the demo will hit at least one.

### 6. Backend structure
- Routers and which endpoints each owns.
- Which files in `app/crud/`, `app/models/`, `app/schemas/` each feature adds.
- Validation rules and business rules (tie each to a requirement ID).
- Alembic: one initial migration for the Must-have schema; seed script or startup seed for demo data.

### 7. Key workflows
A sequence (numbered steps or Mermaid `sequenceDiagram`) for the critical journey and for any workflow with non-trivial logic (AI call, multi-step processing, state transitions).

### 8. Scope cut (proposal — humans decide)
Two lists, each item traced to a requirement ID:
- **Must have** — the critical journey and nothing else.
- **If time permits** — ordered by value-per-hour.

Plus a **Build split** that lets the 4 technical people start in parallel immediately:
- FE engineer, BE engineer, Integration/QA — what each starts with in the first 30 minutes (including FE building against mocked responses that match the contract examples exactly).

Mark this section as a **proposal pending team decision**.

### 9. Open decisions
Every genuine choice where more than one option is reasonable: options (2–3), trade-off, recommendation. The team resolves these and records them in `docs/decision-log.md`.

### 10. Technical risks
Table: risk, likelihood, demo impact, mitigation. Always consider: external API/LLM latency or failure, CORS/proxy misconfiguration, contract drift between FE and BE, seed data missing on a fresh start, anything that requires network at demo time.

## Revisions (mid-hackathon)

- Keep a **Contract version** at the top (`v1`, `v1.1`, `v2`...).
- Additive changes (new optional field, new endpoint) → minor bump. Breaking changes (rename/remove field, change type/status code) → major bump, and call it out in bold.
- Every change gets a row in the **Contract Changelog**: version, change, reason, who must update (FE / BE / both).
- Never silently rewrite a contract that code is already built against.

## Quality checklist (run before writing the file)

- [ ] Critical journey is stated and every Must-have acceptance criterion maps to at least one endpoint/screen.
- [ ] Every endpoint, entity, and page traces to a requirement ID; untraceable items are cut.
- [ ] Every endpoint has request + response examples, field tables, status codes, and errors.
- [ ] Example JSON is valid and consistent with the field tables and the TypeScript/Pydantic types.
- [ ] One error envelope, snake_case, `/api` prefix, `{"items","total"}` lists — no exceptions.
- [ ] `GET /api/health` exists.
- [ ] External/AI calls have a mock mode.
- [ ] Seed data for a fresh-start demo is specified.
- [ ] Scope cut and open decisions are marked as proposals for the team.
- [ ] Nothing requires new infrastructure outside the fixed stack.
- [ ] A FE engineer and a BE engineer could each start building from this document alone, without talking to each other.

## Anti-patterns

- Designing for scale, or production hardening nobody will demo.
- Vague contracts ("returns the user data") — always give the exact shape.
- Adding auth, roles, or settings screens the journey doesn't need.
- Picking between real options silently instead of surfacing them as open decisions.
- Writing implementation code in the architecture doc.
