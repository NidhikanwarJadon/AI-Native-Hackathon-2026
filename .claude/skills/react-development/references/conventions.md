# Conventions

The rule governing each layer. The file set and the order to build them in are in
[../SKILL.md](../SKILL.md); what already exists is in [skeleton.md](skeleton.md).

## 1. API layer — two layers, one rule

Every exported api function wraps the shared HTTP client (`setup/client.ts`) and an entry from
`api/endpoints.ts`, and is typed with request/response interfaces. `endpoints.ts` is the only place
a URL string is written.

Which folder it belongs in: **one caller, and it lives in that module's `api/`; two or more, and it
is promoted to the top-level `api/`.** A login call or a shared lookup is top-level. A listing
endpoint used by exactly one screen is module-local. When a second module later needs a
module-local function, **move** it up and update both callers — never copy it. Two copies of one
endpoint call drift the moment the backend changes a parameter, and the bug surfaces in only one of
the two screens.

Never call Axios from a component, hook, or thunk. The only axios import in the app is in
`setup/client.ts` — that is what guarantees every request gets the base URL, the auth header, the
refresh retry, and sanitized input.

Because `useFetchAPI` inspects the response status itself, an api function used for reads returns
the whole response rather than pre-unwrapping it.

**Sanitization is global, not per-field.** `setup/client.ts`'s request interceptor runs every plain
request body and query-param object through `utility/sanitize.ts`'s `sanitizeInput` before it goes
out — module code never calls it itself. `sanitizeInput` trims every string and strips `<script>`
tags, with no exception for any field name, including a password: a value typed with leading or
trailing whitespace reaches the API trimmed. A request body that's a `FormData` (a file upload) is
left untouched instead — sanitizing one would silently replace it with `{}`.

## 2. `useFetchAPI` — the shared read hook

Every read goes through `useFetchAPI` (default export from `src/hooks/useFetchAPI.ts`); do not write
a replacement for it. It owns the loading and error flags, the success and failure toasts, and the
fallback value. Never hand-roll that in a bare `useEffect`.

It takes one props object:

| Prop | What it does |
|---|---|
| `apiFunction` | this module's `api/` function — receives `apiParams` |
| `apiCallCondition` | the gate: the call fires only while this is truthy, so a detail fetch can wait for an id |
| `apiParams` | the params object handed to `apiFunction` |
| `dependencyArray` | what re-triggers the call — paging, filters, a selected id. The logged-in role is appended automatically, so a role change refetches |
| `defaultResponseValue` | what `data` falls back to when the response is not a success |
| `showSuccessMessage` | whether a successful call toasts. Pass `false` for list and detail reads — a toast on every page change is noise |
| `hideErrorMesssage` | suppresses the failure toast (note the spelling — three s's, it is the real prop name) |
| `successCb` / `failureCb` | callbacks after the state is set |
| `successMessage` / `errorMessage` | override the toast text, otherwise the server message is used |

It returns a **single-element array**, so callers destructure one object holding `data`, `isLoading`
and `hasError`.

The hook toasts by itself. A screen that also toasts on the same outcome double-notifies the user,
so let the hook do it and pass `successMessage` / `errorMessage` when the wording matters.

`dependencyArray` is the whole refetch contract: a value the screen reads but leaves out of that
array means the data silently goes stale.

Each module hook wraps one api function, fixing that call's `apiCallCondition`, `dependencyArray`,
`defaultResponseValue` and toast behaviour in one place. Keeping this in a hook rather than in the
component is what stops two screens configuring the same endpoint differently.

**Reach for a thunk instead** for user-triggered mutations, and for read data that outlives the
screen — something another route needs after navigation. Default to `useFetchAPI` and add a slice
only when a second consumer appears; a slice for one consumer buys a cache-invalidation problem for
nothing.

## 3. Redux slice and thunks

One slice per domain in `reducers/`, registered in `setup/rootReducer.ts` under its state key.
Each slice exports an explicit, named state interface — no inferred-only state shapes — and uses
the shared `ApiStatus` enum for the async lifecycle rather than loose booleans.

One async thunk per user-triggered mutation — save, delete, status change. Each calls **this
module's own** `api/` function unless the action is genuinely cross-module, is typed with its return
type, its argument type and a rejection value, and converts a caught error into a message rather
than leaking the Axios error into state.

Reset-on-logout happens once in the root reducer: on the logout action it clears the persisted
state and returns every slice to its initial state, so no slice can forget to reset. Each slice
still exports its own reset action — the global wipe covers logout, the local reset is what a modal
dispatches when it closes.

Typed `useAppDispatch` / `useAppSelector` are defined once in `setup/store.ts`; never use the
untyped `useDispatch` / `useSelector` directly.

## 4. Route entries

Every route is one object with `path`, `component`, `pageTitle`, `screenPermissions` and
`sidebarHighlightKey`, defined by the `AppRoute` interface in `routers/routeList.ts`. `pageTitle`
comes from `enTranslation.headerTitles`, `screenPermissions` from the permission constants (empty
array means any authenticated user), `sidebarHighlightKey` from the sidebar key constants.

Every routed component is lazy-loaded through `React.lazy` and a dynamic import. An eagerly
imported one compiles fine and silently kills code-splitting, so this is checked by eye, not by the
typechecker.

`PrivateRoute` checks authentication first — no access token redirects to login, preserving the
attempted location — then permissions, redirecting to the unauthorized screen when the required
permissions are not all present.

## 5. CSS — layout only

**Module CSS files carry layout and nothing else**: positioning, flex/grid, width, spacing,
alignment. Colours, radii, fonts, control heights and shadows come from the antd theme in
`setup/theme.ts`, which is the single source of truth for the app's look — antd derives ten shades
from `colorPrimary` alone, so the brand colour is a one-line edit there.

A `background:`, `border-radius:` or `color:` on an antd component in a module's CSS is the smell to
watch for: it duplicates a token locally and drifts from every other screen the moment the theme
changes. When a value genuinely is needed in CSS, read the token rather than retyping the hex —
`setup/theme.ts` sets `cssVar: true`, so antd publishes them as `var(--ant-color-primary)`,
`var(--ant-color-bg-layout)` and so on.

A `css/` subfolder sibling to `forms/`, `lists/`, `modalPopup/`. One file per component, named
lowercase-first after the component — a component named `FooForm` gets `css/fooForm.css` —
imported by relative path from the component file.

Prefix class names with the component name. Plain CSS is global, so an unprefixed class will
collide with another module's and the failure shows up on the screen nobody opened before the demo.

## 6. Formik + Zod

The Zod schema lives in the module's `schema/` folder, alongside its inferred type and its initial
values, typed with that same inferred type. The schema is also the DTO, so never hand-write a type
that duplicates it and never inline a validation rule in a component — either one means the request
type and the validation can disagree with nothing to catch it.

When a module has a list, the form stays presentational: it takes the initial values, a submitting
flag and a submit callback as props, and contains no dispatch and no fetching. The modal owns the
dispatch — it reads the selected record and the save status from the slice, renders the form,
dispatches the save thunk on submit, and on success toasts, resets the slice and closes. That split
is what makes the form reusable on a full-page route.

**When a form has no list or modal — it's a full standalone screen**, like a login or a settings
page: the form component owns the dispatch, the layout and any navigation itself, and there is no
separate page-level wrapper. A wrapper whose only job is to import the form and render it adds a
file and a layer without adding a role; the split only earns its keep when a modal is genuinely a
second consumer of the same form.

**The form element is Formik's own `<Form>`**, not antd's. Wrap the fields in `<Formik
initialValues={...} validationSchema={toFormikValidationSchema(schema)} onSubmit={...}>`, and
render Formik's `<Form>` inside it — it is a plain `<form>` already wired to Formik's submit
handling, so it takes no `onFinish`. antd supplies only the field-level chrome: each field is a
`<Field name="...">{({ field, meta }) => (...)}</Field>` render prop, with antd's `Form.Item`
(import it aliased, e.g. `Form as AntForm`, since `Form` already names Formik's) giving the label
and the `validateStatus` / `help` pair driven by `meta.touched` / `meta.error`, and antd's `Input`
(or another control) spread with `{...field}`. antd's own `rules` prop and `required` flag stay
unused — two validation systems on one field is how you get a form that blocks submit with no
visible error.

Every Zod error message comes from the validation keys in `enTranslation`, never a string literal.

## 7. Lists and columns

Columns are built by an exported function in `config/` that takes the row callbacks as an argument,
so the list can memoize the column array against stable handlers.

The list owns paging and filter state, memoizes the params object it hands to its fetch hook, lists
that state in the hook's `dependencyArray`, wraps each row handler in `useCallback`, and memoizes
the columns against those handlers. It renders the antd table with a row key, the hook's
`isLoading` flag, and server-side pagination.

## 8. `useMemo` / `useCallback`

Both rules are about referential stability, not raw speed.

- **`useMemo`** for derived data that is expensive or that feeds a dependency array — a filtered or
  sorted list, an antd column array built from callbacks, the params object handed to `useFetchAPI`.
- **`useCallback`** for any function passed to a memoized child, into a column config, or listed in
  another hook's dependency array. A fresh function identity defeats the memo.

Do not wrap every value by reflex. A `useMemo` over a cheap expression that reaches neither a
dependency array nor a memoized child costs more than it saves and hides the ones that matter.

## 9. Auth and the token flow

Tokens live in the `auth` slice, persisted by `redux-persist` to localStorage. Nothing else reads
localStorage directly, so there is exactly one source of truth for the session. The slice also
holds the user's role, which `useFetchAPI` reads.

`setup/client.ts` owns the whole token dance:

- the **request interceptor** reads the access token from the store and attaches the bearer
  authorization header;
- the **response interceptor** catches a 401, refreshes once, and replays the original request with
  the new token. It marks the request as retried so a failing refresh cannot loop forever, and it
  shares a single in-flight refresh promise so three parallel 401s trigger one refresh rather than
  three that invalidate each other;
- if the refresh itself fails, it dispatches logout and rejects.
