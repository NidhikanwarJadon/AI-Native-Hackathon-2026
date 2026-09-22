---
name: demo-preparation
description: How to build the final demo script and the AI-native evidence synthesis — the 7-part demo story structure, timing discipline, and how to turn the raw decision-log/ai-evidence logs into a coherent narrative. Use when preparing docs/demo-script.md or docs/ai-approach.md, typically in the 5:30-6:30 PM window.
---

# Demo Preparation Method

This skill is invoked directly by the team (no agent backs it) — it defines *how* to turn the day's raw logs and docs into the final demo script and AI-native narrative, not who does it.

## Inputs

- `docs/problem.md` — the value story: what problem, for whom.
- `docs/architecture.md` — the technical slide: what was built, how.
- `docs/decision-log.md` — raw, append-only record of every human override of an AI proposal.
- `docs/ai-evidence.md` — raw, append-only record of every useful agent/skill output.

Do not write `docs/demo-script.md` or `docs/ai-approach.md` from memory or from scratch — both raw logs are the source material, and dropping to memory is exactly the failure mode this skill exists to prevent.

## Building `docs/ai-approach.md` (synthesis)

1. Read every entry in `docs/ai-evidence.md` and pull out the 3-5 most striking examples of AI acceleration — prefer specific, demonstrable moments over generic ones.
2. Read every entry in `docs/decision-log.md` and pull out the moments where a human meaningfully corrected or rejected an AI proposal — these prove judgement was applied, not just automation.
3. Fill the traditional-vs-AI-native comparison table stage by stage (requirements, architecture, development, testing, documentation, experimentation), grounding each row in an actual entry from one of the two logs, not a generic claim.
4. If a stage has no supporting log entries, leave it honest rather than inventing a plausible-sounding one.

## Building `docs/demo-script.md` (the 7-part story)

Structure the script in this order, each part answering one question:

1. **Problem** — what problem were we asked to solve? (from `docs/problem.md`)
2. **Solution** — what did we build, for whom? (from `docs/solution.md`)
3. **Working Demo** — a literal, rehearsed step-by-step of the primary user journey. No branching paths, no "we could also show..." — one path, rehearsed until it's reliable.
4. **Traditional Approach** — how this would normally be delivered, for contrast.
5. **AI-Native Approach** — where Claude Code, agents and skills changed the workflow (pull from `docs/ai-approach.md`).
6. **Difference / Proof** — concretely, what changed in effort, speed, or quality — backed by the evidence log, not a general impression.
7. **Learning** — what worked, what needed human judgement, what would need hardening for production.

## Timing Discipline

The total slot is **10 minutes**. Budget it like this, and rehearse against a timer, not a feeling:

| Part | Time | Notes |
|---|---|---|
| 1. Problem | 1 min | One or two sentences — don't re-litigate the whole problem statement. |
| 2. Solution | 1 min | What + for whom, no feature laundry list. |
| 3. Working Demo | 4 min | The single largest slice. One rehearsed path through the primary journey, no branching "we could also..." detours. |
| 4. Traditional Approach | 1 min | Just enough contrast to set up part 5. |
| 5. AI-Native Approach | 1.5 min | Name the specific agents/skills used and what each produced. |
| 6. Difference / Proof | 1 min | One or two concrete, evidenced numbers or examples — not a vibe. |
| 7. Learning | 0.5 min | One sentence on what would need hardening for production. |

If rehearsal runs over 10 minutes, cut from parts 1, 2, 4, and 7 first — never from part 3 (the working demo) or part 6 (the proof), since those are what actually distinguish this from a slide deck. A demo script that runs long on narration and short on the actual working software has the story backwards.

Build in an unplanned buffer: rehearse to a **9-minute** target, not 10, so a live hiccup doesn't blow the slot.

## Rule

Rehearse the exact script at least once end-to-end before the freeze at 6:30 PM. Any step that fails in rehearsal gets removed or replaced, not narrated around.
