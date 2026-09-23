# Plan — User List Screen

**Slug:** `user-list` · **Status:** plan-approved · **Owner:** NidhiJadon

> ⚠️ `docs/problem.md` and `docs/architecture.md` are both still empty placeholders — product-analyst
> and solution-architect haven't run yet. Everything below is a conservative assumption, not a fact
> pulled from either doc. Re-check this plan once those docs are filled in; the file manifest may
> change.

## What this feature does

Shows a paginated table of users so the team has one working screen to demo against while the real
requirements/API contract are still being defined.

## Acceptance criteria covered

None — `docs/problem.md` has no acceptance criteria yet. This plan is a placeholder journey, not
tied to a real requirement.

- [ ] *(none yet — flag to product-analyst)*

## Module

`docs/architecture.md` has no entity or endpoint definitions yet, so every row below is a stated
assumption rather than an architecture-doc answer.

| Question | Answer |
|---|---|
| Module name (singular / plural) | `user` / `users` — **assumed** |
| Entity fields, types, required? | `id: string`, `name: string` (required), `email: string` (required) — **assumed minimal shape** |
| Backend endpoints (method, path, req/resp shape) | `GET /users?page=&pageSize=` → `PaginatedResponse<UserDto>` — **assumed, not confirmed against a real backend** |
| Screens (list only / list+form / list+form+detail) | list only |
| Does data outlive the screen (Redux slice needed)? | no — `useFetchAPI` only, no other screen consumes this data |
| What re-triggers the read (paging/filter/id)? | `page`, `pageSize` |
| Permission name(s) / sidebar key | `ScreenPermission.VIEW_USERS`, `SidebarKey.USERS` — **assumed names** |

## File manifest

List-only screen: no `schema/`, `forms/`, `modalPopup/`, `actions/`, `reducer/`, and no
`rootReducer.ts` edit.

| File | New / edit | Holds |
|---|---|---|
| `src/api/endpoints.ts` | edit | `users` URL block |
| `src/constants/permissions.ts` | edit | `VIEW_USERS` `ScreenPermission` entry |
| `src/constants/sidebarKeys.ts` | edit | `USERS` `SidebarKey` entry |
| `src/translations/enTranslation.ts` | edit | header title, column labels, empty-state text |
| `src/modules/user/types/user.types.ts` | new | `UserDto`, list-params type |
| `src/modules/user/api/userApi.ts` | new | `getUsers` typed function |
| `src/modules/user/hooks/useUserList.ts` | new | list read via `useFetchAPI` |
| `src/modules/user/config/userColumns.tsx` | new | column builder |
| `src/modules/user/lists/UserList.tsx` | new | the antd table screen |
| `src/modules/user/css/userList.css` | new | list styles, `userList-` prefixed |
| `src/routers/userRoutes.ts` | new | the module's `AppRoute` entry |
| `src/routers/routes.tsx` | edit | spread `userRoutes` into the tree |

## API endpoints depended on

Assumed — not confirmed against `docs/architecture.md` or a real backend.

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/users` | `page`, `pageSize` query params | `PaginatedResponse<UserDto>` where `UserDto = { id, name, email }` |

## Assumptions

- Entity shape (`id`, `name`, `email`) is a minimal placeholder — no real entity is defined yet.
- Endpoint path and pagination shape follow this codebase's existing `PaginatedResponse` convention,
  not a confirmed backend contract.
- Permission and sidebar key names are invented for this screen; may collide with real names once
  solution-architect defines them.
- No create/edit/delete — read-only list, since no acceptance criteria exist to scope it further.

## Out of scope

- Create, edit, delete user
- Detail view / drill-in
- Search or column filters
- Wiring to a real backend endpoint (none exists yet to wire to)

---

Reply **"approve plan"** to proceed to tasks.md, or leave corrections inline / in your reply.
