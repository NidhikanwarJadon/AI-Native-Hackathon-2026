---
name: react-development
description: How this codebase builds a React feature — the skeleton it plugs into, the full file manifest, the conventions and the build order. Use whenever a new feature, module, screen, CRUD page, listing page or form is added to the frontend, or an endpoint or screen is added to an existing module. Triggers on "create a new feature", "add a Users module", "build the orders screen", "wire up the invoices API", "scaffold a screen" — even when the word "module" is never used.
---

# React Development

**How** a feature is built here. Who owns the work and what they may read is answered separately by
[the frontend-engineer agent](../../agents/frontend-engineer.md).

Read alongside this file:

- [references/skeleton.md](references/skeleton.md) — the stack, the folder map, and the shared
  pieces that already exist. **Read this first on a new feature** — a feature imports them, it
  never re-creates them.
- [references/conventions.md](references/conventions.md) — the rule for each layer: the two-layer
  API split, `useFetchAPI`, slices, routes, CSS, Formik + Zod, memoization, auth, and the don'ts.

---

## Step 1 — Pin the module down

Answer these from `docs/architecture.md`, from the user, or from an existing module. A wrong answer
propagates into every file below.

| Question | What it drives |
|---|---|
| Module name, singular and plural (`user` / `users`) | every filename, slice name, route path and translation key |
| The entity's fields, their types, and which are required | the Zod schema, and therefore the form type and the DTO |
| Backend endpoints — method, path, request and response shape | the `ENDPOINTS` block and the module's `api/` functions |
| Which screens: list only, list + form, list + form + detail | whether `forms/`, `modalPopup/` and a detail route exist |
| Does any other screen need this data after navigation? | `useFetchAPI` alone, or a Redux slice as well |
| What re-triggers the read — paging, filters, a selected id? | each hook's `dependencyArray` and `apiCallCondition` |
| Permission names and sidebar key | the constants files and every route entry |

If the architecture doc or an OpenAPI file answers a question, read it rather than asking. If
something is genuinely unknowable, take the conservative default — field optional, a view permission
named after the module, list + form + modal — state the assumption in one line, and keep moving. One
wrong assumption is cheaper to correct than six questions are to answer.

**Skip this scaffold for small work.** One more endpoint, or one more column, is a two-file edit —
just make it, following the conventions. The manifest earns its overhead at roughly five files up.

**More than one module in scope?** Finish this one first, wired to the real backend. A second module
started while the first one's integration is unverified leaves two half-integrated screens instead
of one working journey.

---

## Step 2 — The file manifest

Substitute `<module>` (camelCase singular, e.g. `user`) and `<Module>` (PascalCase, e.g. `User`).

| File | New / edit | Holds |
|---|---|---|
| `src/api/endpoints.ts` | edit | the module's URL block |
| `src/constants/permissions.ts` | edit | the module's `ScreenPermission` entries |
| `src/constants/sidebarKeys.ts` | edit | the module's `SidebarKey` entry |
| `src/translations/enTranslation.ts` | edit | every string the module will display |
| `src/modules/<module>/schema/<module>FormSchema.ts` | new | Zod object, inferred form type, initial values |
| `src/modules/<module>/types/<module>.types.ts` | new | DTO, list-params type, request types |
| `src/modules/<module>/api/<module>Api.ts` | new | one typed function per endpoint |
| `src/modules/<module>/hooks/use<Module>List.ts` | new | list read, through `useFetchAPI` |
| `src/modules/<module>/hooks/use<Module>Detail.ts` | new — detail screens only | detail read |
| `src/actions/<module>Actions.ts` | new — skip if read-only | one thunk per mutation |
| `src/reducers/<module>Reducer.ts` | new — skip if read-only | the slice |
| `src/modules/<module>/config/<module>Columns.tsx` | new | column builder taking the row callbacks |
| `src/modules/<module>/lists/<Module>List.tsx` | new | the antd table screen |
| `src/modules/<module>/forms/<Module>Form.tsx` | new | presentational Formik form |
| `src/modules/<module>/modalPopup/<Module>Modal.tsx` | new | the modal that owns the dispatch |
| `src/modules/<module>/css/<module>List.css` | new | list styles, class names prefixed |
| `src/modules/<module>/css/<module>Form.css` | new | form styles, class names prefixed |
| `src/routers/<module>Routes.ts` | new | the module's `AppRoute` entries |
| `src/routers/routes.tsx` | edit | spread the module's routes into the tree |
| `src/setup/rootReducer.ts` | edit | register the slice under its state key |

---

## Step 3 — Build in this order

Each wave depends only on the waves above it, so nothing is ever written against a signature that
does not exist yet. The rule governing each layer is in
[references/conventions.md](references/conventions.md).

| Wave | Files | Why here |
|---|---|---|
| 1 — registries | the four `edit` rows at the top of the manifest | every later layer imports these names |
| 2 — contract | `schema/`, then `types/` | the schema is what the form type and the DTO derive from |
| 3 — data | module `api/`, then module `hooks/` | needs Wave 2's types |
| 4 — redux | `actions/`, `reducers/` | needs Wave 3's api functions |
| 5 — UI | `config/`, `lists/`, `forms/`, `modalPopup/`, `css/` | needs the hooks and the slice |
| 6 — wiring | `routers/<module>Routes.ts`, `routes.tsx`, `rootReducer.ts` | needs the components to exist |

Three things that are easy to get wrong:

- **Wave 1 is additive.** Add the new block; do not reorder, rename or reformat what is there.
  Other modules import from these files. Add every string the module will ever display now —
  titles, labels, buttons, validation messages, toasts — or some component will inline one.
- **Write the schema before anything derived from it**, since the form type and the DTO are both
  read off it.
- **Skip Wave 4 entirely** when the module only reads data and nothing outside the screen needs it.

---

## Step 4 — Verify, then report

Run `npx tsc -b` (or `npm run build`) and `npm run lint`.

Typecheck failures here are almost always drift between the schema and one of its consumers. Fix
them in the schema or types file, not with a cast at the call site — a cast makes the same mismatch
reappear the next time anyone touches the module.

Report the files created, the files edited, the actual typecheck and lint output, and every
assumption made. If lint or typecheck still fails, say so with the errors rather than describing the
feature as done.

---

## Definition of done

- [ ] `npx tsc -b` and `npm run lint` clean — actual output pasted, not claimed
- [ ] Every endpoint call lives in `modules/<module>/api/` (one caller) or `src/api/` (two or more)
- [ ] Every read goes through `useFetchAPI`, its `dependencyArray` listing everything the screen
      can change
- [ ] The form type is inferred from the Zod schema, not hand-written
- [ ] Every routed component is lazy, with `screenPermissions` and `sidebarHighlightKey` set
- [ ] The slice is registered in `rootReducer.ts`, exports its reset action, resets on logout
- [ ] One `.css` per component in the module's `css/`, lowercase-first name, prefixed classes
- [ ] No user-facing string outside `translations/enTranslation.ts`
- [ ] `grep -rn "from 'axios'" src/ --include=*.ts --include=*.tsx` returns only `setup/client.ts`
- [ ] `grep -rn ": any\|<any>\|as any" src/modules/<module>/` returns nothing
- [ ] If this isn't the first module today, the previous one's critical-path screens are already
      verified against the real backend
- [ ] An entry appended to `docs/ai-evidence.md` for what this run produced
