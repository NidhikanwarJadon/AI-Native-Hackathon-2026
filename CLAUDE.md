# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Hackathon starter repo: React (frontend/) + FastAPI (backend/), with problem/solution docs in docs/ and custom Claude Code agents/skills in .claude/. The specific problem statement is defined on the day in docs/problem.md.

## Agents — Read/Write Contract

Each agent owns exactly one stage and one file to write. The contract below is what makes parallel work possible — follow it strictly, don't let an agent read or write outside its lane.

| Agent | Reads | Writes | Rule |
|---|---|---|---|
| `product-analyst` | The raw problem statement only | `docs/problem.md` | Proposes requirements/acceptance criteria; the two functional team members must validate before anything downstream starts. |
| `solution-architect` | `docs/problem.md` | `docs/architecture.md` (components, data model, **API contract**) | Hard decision gate before parallel build starts — this file is the only thing `frontend-engineer` and `backend-engineer` share. |
| `frontend-engineer` | `docs/architecture.md`, acceptance criteria in `docs/problem.md` | Code in `frontend/`, `docs/solution.md` (MVP scope as it lands) | Never reads backend code. Depends only on the API contract in `architecture.md`. |
| `backend-engineer` | `docs/architecture.md`, acceptance criteria in `docs/problem.md` | Code in `backend/`, `docs/solution.md` (MVP scope as it lands) | Never reads frontend code. Depends only on the API contract in `architecture.md`. |
| `qa-reviewer` | `docs/problem.md` (acceptance criteria), code in `frontend/` + `backend/` | `docs/testing.md` | Produce the prioritized defect/risk list first. Do not fix issues while reviewing — review is a separate pass from fixing. |

## Skills

No agent backs `demo-preparation` — it's invoked directly by the humans on the team.

| Skill | Backs | Reads | Writes |
|---|---|---|---|
| `requirements-analysis` | `product-analyst` | raw problem statement | `docs/problem.md` |
| `architecture-design` | `solution-architect` | `docs/problem.md` | `docs/architecture.md` |
| `react-development` | `frontend-engineer` | `docs/architecture.md` | `frontend/` |
| `fastapi-development` | `backend-engineer` | `docs/architecture.md` | `backend/` |
| `testing` | `qa-reviewer` | code, `docs/problem.md` | `docs/testing.md` |
| `demo-preparation` | (human-invoked, no agent) | `docs/problem.md` (value story), `docs/architecture.md` (technical slide) | `docs/demo-script.md`, `docs/ai-approach.md` |

## Append-Only Shared Logs

`docs/decision-log.md` and `docs/ai-evidence.md` are **append-only and unowned** — no agent or single team member is responsible for them; everyone writes to them as the day happens.

- `docs/decision-log.md` — one entry every time a human overrides, corrects, or chooses between AI-proposed options.
- `docs/ai-evidence.md` — one entry every time an agent or skill produces something useful.

Write to these in the moment, not retroactively — by 6:00 PM the specifics are gone from memory. `docs/ai-approach.md` and `docs/demo-script.md` are synthesized from these two logs, not written from scratch.

## Building the Agent Definitions

`.claude/agents/` currently only holds placeholders. Whoever implements the real agent files must make each agent's **final action** writing (or updating) the doc file in its "Writes" column above — the docs in `docs/` are intentionally left as one-line pointers (not pre-filled) precisely because the agent, not a human, produces that content when run. An agent that stops short of writing its file hasn't finished its job.

## Working Rules

- Do not build business functionality speculatively before the problem statement is known — the skeleton is intentionally empty.
- Optimise for one complete end-to-end journey (MVP) over multiple incomplete features.
- Respect each agent's read/write lane above — it's what lets frontend and backend work run genuinely in parallel.
