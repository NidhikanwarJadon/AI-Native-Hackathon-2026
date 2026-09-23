---
name: frontend-feature
description: Runs one frontend feature through plan → approval → tasks → approval → implementation, tracking its status the whole way. Use when the user asks to start, plan, resume, or check the status of a frontend feature, or types /frontend-feature. Two human approval gates (plan, then tasks) sit before any code is written.
---

# Feature Workflow

Orchestration on top of [the frontend-engineer agent](../../agents/frontend-engineer.md) and the
[react-development skill](../react-development/SKILL.md). Those two still own **how** React code is
written and **what** frontend-engineer may read/write. This skill owns the **sequence** a feature
goes through before and during that work: plan, human approval, tasks, human approval, build,
status tracking.

Frontend only, for now — `docs/frontend-features/` is not part of the CLAUDE.md read/write contract, so it
doesn't compete with any agent's lane. Nothing here changes frontend-engineer's own duty to write
the frontend section of `docs/solution.md` as its final action — this skill runs alongside that, not
instead of it.

---

## Files this skill owns

| File | Written | Purpose |
|---|---|---|
| `docs/frontend-features/status.md` | every transition below | single table — one row per feature, current status, owner, description |
| `docs/frontend-features/<slug>/plan.md` | Step 2 | what the feature does and how it's built, from [references/plan-template.md](references/plan-template.md) |
| `docs/frontend-features/<slug>/tasks.md` | Step 4 | the checkable build list, from [references/tasks-template.md](references/tasks-template.md) |

`<slug>` is the feature name, kebab-case (`user management` → `user-management`). Reuse the same
slug for every file belonging to one feature.

---

## Step 0 — Intake

Invoked as `/frontend-feature <description>`, or with a bare slug to resume one already in flight.

1. Derive `<slug>` from the description (or use the slug given).
2. Read `docs/frontend-features/status.md`. If it doesn't exist yet, create it from
   [references/status-template.md](references/status-template.md).
3. If a row for `<slug>` already exists, **resume from its current status** (see the state table
   below) — do not restart the plan. Show the user the row and what happens next.
4. If it's new, add a row: status `planning`, owner = the git user running this (`git config
   user.name`, ask only if that's empty), description = what the user typed, started = today.

---

## Step 1 — States

Drive every transition through exactly these values, in this order. Never skip one, even when a
step feels like a formality — the status.md row is what the rest of the team reads to know what's
safe to touch.

| Status | Meaning | Who unblocks it |
|---|---|---|
| `planning` | plan.md being drafted | this skill |
| `plan-review` | plan.md written, waiting on approval | **human** |
| `plan-approved` | plan approved, tasks.md not started yet | this skill |
| `tasks-review` | tasks.md written, waiting on approval | **human** |
| `tasks-approved` | tasks approved, build not started yet | this skill |
| `in-progress` | tasks being implemented, one at a time | this skill |
| `done` | every task checked off, solution.md updated | — |
| `blocked` | waiting on something outside this feature | **human** — note why in the status row |

After every write to `plan.md`, `tasks.md`, or a task checkbox, update the matching row in
`status.md` (status + `Updated` timestamp) in the same turn — don't batch it for later.

---

## Step 2 — Plan (gate 1)

Read `docs/architecture.md` and the acceptance criteria in `docs/problem.md` relevant to this
feature. Do not read backend code — same lane as frontend-engineer.

Fill [references/plan-template.md](references/plan-template.md) into `docs/frontend-features/<slug>/plan.md`.
Use react-development's **Step 1 — Pin the module down** table and **Step 2 — the file manifest** to
answer the module questions and produce the file list — don't re-derive those from scratch.

Set status to `plan-review` and **stop**. Show the user the plan and ask them to reply "approve
plan" or give corrections. Do not draft tasks.md until they do.

On correction: edit plan.md in place, log the correction in `docs/decision-log.md` (a human
overrode an AI-proposed option), and ask again.

On approval: set status to `plan-approved`.

---

## Step 3 — Tasks (gate 2)

Fill [references/tasks-template.md](references/tasks-template.md) into
`docs/frontend-features/<slug>/tasks.md`, using react-development's **Step 3 — Build in this order** (the six
waves) to sequence tasks so nothing is built against a signature that doesn't exist yet. One task per
file from the plan's manifest, each with: the wave, the file, done-when, and which plan section /
acceptance criterion it satisfies.

Set status to `tasks-review` and **stop**. Show the user the task list and ask them to reply "approve
tasks" or give corrections. Do not start implementation until they do.

On correction: edit tasks.md in place, log it in `docs/decision-log.md`, ask again.

On approval: set status to `tasks-approved`, then immediately move to Step 4 in the same turn — no
need for a third human turn to say "go".

---

## Step 4 — Implementation

Set status to `in-progress`. Invoke the **react-development** skill and build the waves in order,
exactly as tasks.md lists them.

After each task lands (file written, typechecks against what exists so far):
- Check its box in `tasks.md`.
- Leave `status.md` at `in-progress` — only the per-task checkbox moves until the whole feature is
  done, so the table doesn't thrash on every file.

Follow frontend-engineer's own judgement calls while building (ambiguous contract → conservative
assumption + one-line note, not a stop; scope protection; quality gates). This skill governs
sequencing and tracking, not those calls.

If a task turns out to be wrong once you're inside it (the plan's assumption doesn't hold against
the real architecture doc), don't silently deviate — set status to `blocked`, say what's wrong, and
wait. Small corrections that don't change the file manifest (a field name, a wording) don't need a
new approval pass; anything that changes which files get touched does.

---

## Step 5 — Done

Once every task in `tasks.md` is checked:

1. Run the react-development skill's verification (`npx tsc -b`, `npm run lint`) and paste the
   actual output — same rule as always, don't claim clean without the output.
2. Write/update the frontend section of `docs/solution.md` — frontend-engineer's existing duty,
   still required here.
3. Append an entry to `docs/ai-evidence.md` for the feature.
4. Set status to `done`, `Updated` to today.

A feature isn't done because the code compiles — it's done because `status.md` says `done` and
`solution.md` reflects it.

---

## Definition of done

- [ ] `docs/frontend-features/status.md` has a row for the feature at every status transition, not just the
      end states
- [ ] `plan.md` was approved before `tasks.md` was drafted
- [ ] `tasks.md` was approved before any file was written
- [ ] Every task in `tasks.md` is checked, in wave order
- [ ] `npx tsc -b` and `npm run lint` output pasted, not claimed
- [ ] Frontend section of `docs/solution.md` written
- [ ] An entry appended to `docs/ai-evidence.md`
- [ ] Any human correction along the way logged in `docs/decision-log.md`
