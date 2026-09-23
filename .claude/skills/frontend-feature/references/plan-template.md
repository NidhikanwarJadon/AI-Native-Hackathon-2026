# Plan — &lt;Feature Name&gt;

**Slug:** `<slug>` · **Status:** plan-review · **Owner:** &lt;name&gt;

## What this feature does

One or two sentences. What the user can do once this ships that they can't today.

## Acceptance criteria covered

List the exact bullets from `docs/problem.md` this feature satisfies. If none exist yet for this
feature, say so — that's a signal to check with product-analyst before building, not to invent one.

- [ ] &lt;AC from docs/problem.md&gt;

## Module

Answered from `docs/architecture.md` per react-development Step 1 — pin the module down. State the
assumption in one line wherever the architecture doc doesn't answer directly; don't leave it blank.

| Question | Answer |
|---|---|
| Module name (singular / plural) | |
| Entity fields, types, required? | |
| Backend endpoints (method, path, req/resp shape) | |
| Screens (list only / list+form / list+form+detail) | |
| Does data outlive the screen (Redux slice needed)? | |
| What re-triggers the read (paging/filter/id)? | |
| Permission name(s) / sidebar key | |

## File manifest

Copy the relevant rows from react-development's Step 2 file manifest, `New`/`edit` marked, for this
module specifically — drop rows that don't apply (e.g. skip the detail hook for a list-only screen).

| File | New / edit | Holds |
|---|---|---|
| | | |

## API endpoints depended on

From `docs/architecture.md`'s API contract. Frontend-engineer never opens backend code — if a shape
is ambiguous here, take the conservative reading and note it below rather than going to look.

| Method | Path | Request | Response |
|---|---|---|---|

## Assumptions

Anything taken as a conservative default because the architecture doc or problem.md didn't answer
it directly. One line each — these are what a human is approving along with the rest of the plan.

-

## Out of scope

What this feature deliberately does not cover, so scope doesn't creep once tasks are underway.

-

---

Reply **"approve plan"** to proceed to tasks.md, or leave corrections inline / in your reply.
