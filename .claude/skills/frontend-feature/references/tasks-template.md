# Tasks — &lt;Feature Name&gt;

**Slug:** `<slug>` · **Status:** tasks-review · Plan: [plan.md](plan.md)

Waves match react-development Step 3 — each wave depends only on the ones above it. Work top to
bottom; don't start a later wave's task before every task in the wave above it is checked.

## Wave 1 — registries

- [ ] `src/api/endpoints.ts` — add `<module>` URL block · done when: every endpoint from plan.md's
      API table has an entry · plan: File manifest
- [ ] `src/constants/permissions.ts` — add `<Module>` `ScreenPermission` entries · plan: Module
- [ ] `src/constants/sidebarKeys.ts` — add `<Module>` `SidebarKey` entry · plan: Module
- [ ] `src/translations/enTranslation.ts` — add every string the module displays · plan: Module

## Wave 2 — contract

- [ ] `src/modules/<module>/schema/<module>FormSchema.ts` — Zod object, inferred type, initial
      values · done when: every required field from plan.md's entity table is validated
- [ ] `src/modules/<module>/types/<module>.types.ts` — DTO, list-params, request types

## Wave 3 — data

- [ ] `src/modules/<module>/api/<module>Api.ts` — one typed function per endpoint in plan.md's API
      table
- [ ] `src/modules/<module>/hooks/use<Module>List.ts` — list read via `useFetchAPI`
- [ ] `src/modules/<module>/hooks/use<Module>Detail.ts` — detail screens only, skip otherwise

## Wave 4 — redux (skip entirely if the module only reads data for this one screen)

- [ ] `src/actions/<module>Actions.ts` — one thunk per mutation
- [ ] `src/reducers/<module>Reducer.ts` — the slice, registered later in Wave 6

## Wave 5 — UI

- [ ] `src/modules/<module>/config/<module>Columns.tsx` — column builder
- [ ] `src/modules/<module>/lists/<Module>List.tsx` — the antd table screen
- [ ] `src/modules/<module>/forms/<Module>Form.tsx` — presentational Formik form
- [ ] `src/modules/<module>/modalPopup/<Module>Modal.tsx` — owns the dispatch
- [ ] `src/modules/<module>/css/<module>List.css`
- [ ] `src/modules/<module>/css/<module>Form.css`

## Wave 6 — wiring

- [ ] `src/routers/<module>Routes.ts` — `AppRoute` entries, lazy-loaded, permissions +
      sidebarHighlightKey set
- [ ] `src/routers/routes.tsx` — spread the module's routes in
- [ ] `src/setup/rootReducer.ts` — register the slice (skip if Wave 4 was skipped)

## Verify

- [ ] `npx tsc -b` clean — output pasted in the completion report
- [ ] `npm run lint` clean — output pasted in the completion report
- [ ] Frontend section of `docs/solution.md` updated
- [ ] Entry appended to `docs/ai-evidence.md`

---

Reply **"approve tasks"** to start implementation, or leave corrections inline / in your reply.
