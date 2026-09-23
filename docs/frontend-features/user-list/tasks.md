# Tasks — User List Screen

**Slug:** `user-list` · **Status:** done · Plan: [plan.md](plan.md)

List-only screen — no schema/forms/modalPopup/redux, per plan.md's file manifest. Waves 2 and 4
from the standard six are empty here and skipped entirely.

## Wave 1 — registries

- [x] `src/api/endpoints.ts` — add `users` URL block (`GET /users`) · done when: `ENDPOINTS.users`
      resolves the list path · plan: API endpoints
- [x] `src/constants/permissions.ts` — add `VIEW_USERS` `ScreenPermission` entry · plan: Module
- [x] `src/constants/sidebarKeys.ts` — add `USERS` `SidebarKey` entry · plan: Module
- [x] `src/translations/enTranslation.ts` — add header title, column labels (Name, Email),
      empty-state text · plan: Module

## Wave 3 — data

- [x] `src/modules/user/types/user.types.ts` — `UserDto { id, name, email }`, list-params type ·
      plan: Module (entity fields)
- [x] `src/modules/user/api/userApi.ts` — `getUsers(params)` typed function calling
      `ENDPOINTS.users` · plan: API endpoints
- [x] `src/modules/user/hooks/useUserList.ts` — list read via `useFetchAPI`, `dependencyArray`
      covering `page`/`pageSize`, `showSuccessMessage: false` · plan: Module (re-trigger)

## Wave 5 — UI

- [x] `src/modules/user/config/userColumns.tsx` — column builder for `id`/`name`/`email`
- [x] `src/modules/user/lists/UserList.tsx` — antd table screen: owns paging state, memoized
      params/columns, server-side pagination, row key, `isLoading` from the hook
- [x] `src/modules/user/css/userList.css` — `userList-` prefixed classes

## Wave 6 — wiring

- [x] `src/routers/userRoutes.ts` — one `AppRoute` entry, lazy-loaded, `screenPermissions:
      [ScreenPermission.VIEW_USERS]`, `sidebarHighlightKey: SidebarKey.USERS`
- [x] `src/routers/routes.tsx` — spread `userRoutes` into the route tree

(No Wave 4 / `rootReducer.ts` edit — read-only, single consumer, per plan.md.)

## Verify

- [x] `npx tsc -b` clean — output pasted in the completion report
- [x] `npm run lint` clean — output pasted in the completion report
- [x] Frontend section of `docs/solution.md` updated
- [x] Entry appended to `docs/ai-evidence.md`

---

Reply **"approve tasks"** to start implementation, or leave corrections inline / in your reply.
