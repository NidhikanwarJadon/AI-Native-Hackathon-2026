<!-- Updated by `frontend-engineer` / `backend-engineer` as MVP scope lands during the build. Do not pre-fill by hand. -->

## Frontend

### User List Screen (placeholder, scaffolding exercise)

Built via the `/frontend-feature` workflow (slug `user-list`), run before `product-analyst` and
`solution-architect` had produced `docs/problem.md` / `docs/architecture.md`. Both docs were still
empty placeholders at build time, so this screen is **not tied to a real acceptance criterion or a
confirmed API contract** — it exists to prove the frontend module-scaffolding workflow end to end,
not as a piece of the real MVP journey. Full assumptions are recorded in
`docs/frontend-features/user-list/plan.md`.

What shipped: a read-only, server-paginated Ant Design table at route `/users`, showing `id`,
`name`, `email` columns, gated behind an assumed `ScreenPermission.VIEW_USERS` /
`SidebarKey.USERS`. No create/edit/delete, no detail view, no filters — list-only, per the approved
plan. No Redux slice — the screen is the only consumer of this data, so it reads through
`useFetchAPI` alone.

**Not wired to a real backend.** `getUsers` calls `GET /users` (`ENDPOINTS.users.list`) exactly as
specified in the plan, but no backend endpoint exists yet to answer it — this is scaffolding, not a
completed integration. When the real architecture doc and API contract land, this module (entity
shape, endpoint path, permission/sidebar key names) should be re-checked and very likely revised
before it's treated as the real Users screen.

Files: `src/modules/user/{types,api,hooks,config,lists,css}/*`, `src/routers/userRoutes.ts`, plus
edits to `src/api/endpoints.ts`, `src/constants/permissions.ts`, `src/constants/sidebarKeys.ts`,
`src/translations/enTranslation.ts`, `src/routers/routes.tsx`.

`npx tsc -b` and `npm run lint` both pass clean (see `docs/frontend-features/user-list/tasks.md`
Verify section for the run's checked-off status).
