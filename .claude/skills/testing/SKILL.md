---
name: testing
description: How to review an implementation against requirements and report findings — severity scheme, what counts as a valid finding, and the reproduce-before-reporting rule. Use whenever reviewing code for defects/risk, writing docs/testing.md, or triaging bugs against acceptance criteria.
---

# Testing / QA Review Method

This skill is the "how" for any QA pass — it does not say who runs it or which files to touch (that's the agent's job); it says how to conduct the review itself.

## Severity Scheme

Rank every finding using exactly one of these:

- **P0** — breaks the primary demo journey. Nothing else matters until this is fixed.
- **P1** — a visible bug or gap, but the demo journey still completes.
- **P2** — minor or cosmetic. Would matter in production, not for the demo.

## What Counts as a Valid Finding

Every finding must trace back to one of:
- A specific acceptance criterion or requirement.
- A user journey step that breaks or behaves unexpectedly.
- A mismatch between the frontend and backend's shared API contract (request/response shape, status code, field name).

Reject vague "code quality" complaints that don't map to one of the above — that's not this skill's job.

## Method

1. Walk each acceptance criterion one at a time and check whether the current implementation satisfies it.
2. For each requirement, ask what edge case it implies (empty state, invalid input, error path, duplicate/concurrent action) and check whether that's handled.
3. Cross-check frontend and backend against the documented API contract, not against each other's assumptions.
4. Assign severity using the scheme above.

## Reporting Format

For each finding, record:
- **Severity** (P0/P1/P2)
- **What's wrong**
- **How to reproduce it**
- **Which acceptance criterion / journey / contract it violates**

Produce the complete list before fixing anything — review and fix are separate passes, even when the same person or agent does both. If a suspected issue can't be reproduced, report it as unconfirmed rather than as a defect.
