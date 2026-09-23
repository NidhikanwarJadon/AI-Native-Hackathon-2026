---

name: architecture-design
description: Create or revise docs/architecture.md from validated docs/problem.md for a React + TypeScript + Vite frontend and FastAPI backend. Defines the FE/BE boundary, data model, API contract, workflows, scope, and technical risks. Use when designing architecture, changing scope, or resolving FE/BE contract mismatches.

# Architecture Design
Create `docs/architecture.md` as the implementation contract between frontend and backend engineers.

**Input:** `docs/problem.md`
**Output:** `docs/architecture.md`

The architecture must be specific enough that FE and BE engineers can work independently without relying on each other's implementation.

## Fixed Stack

Do not redesign the stack.

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Frontend   | React + TypeScript + Vite          |
| Routing    | Client-side routing                |
| Backend    | FastAPI + Python                   |
| Validation | Pydantic v2                        |
| Database   | SQLAlchemy + Alembic               |
| Config     | Pydantic Settings + `DATABASE_URL` |
| Auth       | JWT + bcrypt, only if required     |
| API        | `/api/*`                           |
| Dev        | Vite proxies `/api` to FastAPI     |
| Demo       | FastAPI serves built frontend      |

Do not introduce Redis, queues, microservices, Docker orchestration, or other infrastructure unless a Must-have requirement genuinely requires it.

---

# Architecture Requirements

## 1. Critical Journey

Extract the single end-to-end journey required for the demo:

`Entry → Main Screen → Action → Processing → Result → Value`

List the requirement/acceptance-criterion IDs covered by this journey.

Anything outside this journey should normally be **If-time-permits**.

---

## 2. System Architecture

Identify:

* Frontend pages/components
* FastAPI routers/services
* Database entities
* External APIs/LLMs, if any

Include one Mermaid or ASCII diagram showing:

`Frontend → FastAPI → Database`

and external services where applicable.

### Boundary

* Frontend only depends on the documented API contract.
* Backend does not depend on frontend screens/components.
* Backend owns validation and business rules.
* Frontend owns presentation and UI state.
* External/AI calls must be isolated behind a backend service.
* External/AI integrations must support a mock mode for demo reliability.

---

## 3. Data Model

Document only entities required by the Must-have journey.

Prefer **≤5 entities**.

For every entity specify:

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |

Also specify:

* Relationships
* Primary/foreign keys
* Required seed/demo data

Do not model future features.

---

# 4. API Contract

This is the most important section.

All APIs use `/api`.

For every endpoint document:

### Endpoint

`METHOD /api/path`

* Purpose
* Requirement IDs
* Authentication: Yes/No
* Path/query parameters
* Request body
* Success response
* Error responses

### Request

Provide:

1. Pydantic model name
2. TypeScript interface
3. Field table
4. Exact JSON example

### Response

Provide:

1. Pydantic model name
2. TypeScript interface
3. Field table
4. Exact JSON example
5. HTTP status code

### Errors

Use this envelope for application errors:

```json
{
  "detail": "Human-readable message",
  "code": "MACHINE_CODE"
}
```

FastAPI validation errors (`422`) retain FastAPI's standard format.

### API Rules

* JSON keys use `snake_case`.
* IDs use integers unless there is a clear reason otherwise.
* Timestamps use ISO-8601 UTC.
* List responses use:

```json
{
  "items": [],
  "total": 0
}
```

* Keep the MVP to roughly **4–8 endpoints**.
* Avoid endpoints that do not support the critical journey.

### Required Endpoint

```http
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

---

# 5. Frontend Structure

Define pages based on the critical journey.

For each page specify:

* Route
* Purpose
* Main components
* API calls
* Loading state
* Empty state
* Error state

Use:

* Local React state by default
* A small `api/` client for backend calls

Do not introduce Redux/Zustand/etc. unless the requirements justify it.

---

# 6. Backend Structure

Map features to:

```text
app/
├── routers/
├── schemas/
├── models/
├── crud/
└── services/
```

Specify:

* Router and endpoints
* Pydantic schemas
* SQLAlchemy models
* CRUD/business logic
* External/AI services
* Validation/business rules
* Alembic migration
* Demo seed data

Business rules must reference requirement IDs.

---

# 7. Key Workflows

Document only workflows containing meaningful logic.

Use Mermaid sequence diagrams where useful.

At minimum document the critical journey:

```text
User
 ↓
Frontend
 ↓
FastAPI
 ↓
Validation / Business Logic
 ↓
Database / External Service
 ↓
FastAPI Response
 ↓
Frontend Result
```

For AI/external processing, show:

`Request → Backend → External Service → Validation → Response`

Include mock mode behavior.

---

# 8. Scope

Mark this section:

**Proposal — pending team decision**

### Must-have

Only functionality required to complete the critical journey.

Each item must reference a requirement ID.

### If-time-permits

Features outside the critical journey, ordered by value and implementation effort.

### Build Split

Define what each person can start immediately:

**Frontend**

* Build pages/components
* Create API client
* Use mocked responses matching the API contract

**Backend**

* Create models/schemas
* Implement APIs
* Add migration and seed data

**Integration/QA**

* Validate API contract
* Prepare test cases
* Test FE/BE integration
* Verify critical journey

---

# 9. Open Decisions

Include only decisions that genuinely require team input.

For each:

| Decision | Options | Trade-off | Recommendation |
| -------- | ------- | --------- | -------------- |

Record the final decision in `docs/decision-log.md`.

Do not hide architectural choices inside implementation details.

---

# 10. Technical Risks

Keep this short.

| Risk                     | Likelihood | Demo Impact | Mitigation                     |
| ------------------------ | ---------- | ----------- | ------------------------------ |
| External API/LLM failure | Medium     | High        | Mock mode                      |
| FE/BE contract drift     | Medium     | High        | Freeze API contract            |
| CORS/proxy issue         | Medium     | Medium      | Verify `/api/health` early     |
| Missing seed data        | Medium     | High        | Startup/seed script            |
| Network dependency       | Medium     | High        | Minimize external dependencies |

Add other risks only when specific to the project.

---

# Contract Versioning

Start with:

`Contract Version: v1`

When architecture changes:

* **Minor version**: additive, backward-compatible change
* **Major version**: breaking change

Maintain:

| Version | Change | Reason | Owner |
| ------- | ------ | ------ | ----- |

Never silently change an API already being implemented.

---

# Final Validation

Before completing `docs/architecture.md`, verify:

* [ ] Critical journey is clearly defined.
* [ ] Every Must-have requirement maps to a screen, API, workflow, or data entity.
* [ ] Every API has exact request/response examples.
* [ ] FE and BE types match.
* [ ] APIs use `/api`.
* [ ] JSON uses `snake_case`.
* [ ] List responses use `items` + `total`.
* [ ] `/api/health` exists.
* [ ] Errors use the defined envelope.
* [ ] AI/external services have mock mode.
* [ ] Fresh-start seed data is defined.
* [ ] No unnecessary infrastructure is introduced.
* [ ] FE and BE can work independently from the document.

# Anti-patterns

Do not:

* Design for production scale during a one-day hackathon.
* Add infrastructure without a Must-have justification.
* Add authentication when the journey does not require it.
* Create APIs without exact contracts.
* Put frontend implementation details in backend architecture.
* Put backend implementation details in frontend architecture.
* Model future features.
* Silently make unresolved architectural decisions.
* Write implementation code in `architecture.md`.
