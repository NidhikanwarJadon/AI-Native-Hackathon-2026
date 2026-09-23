# The Skeleton A Feature Plugs Into

`frontend/` is already scaffolded and wired. A new feature **imports** these; it never re-creates
them, and it never introduces a second HTTP client, fetch hook, toast helper or status map.

The rule governing each of them is in [conventions.md](conventions.md).

## What already exists

| What you need | Where it is | What it gives you |
|---|---|---|
| HTTP client | `src/setup/client.ts` | the configured Axios instance (default export) — base URL, bearer header, one-shot 401 refresh and replay |
| URL registry | `src/api/endpoints.ts` | the `ENDPOINTS` object — the only place a URL string is written |
| Data fetching | `src/hooks/useFetchAPI.ts` | the shared read hook (default export) |
| HTTP status codes | `src/utility/apiStatus.ts` | `API_STATUS` (default export) — the response codes `useFetchAPI` compares against |
| Async lifecycle | `src/setup/apiStatus.ts` | the `ApiStatus` enum slices use instead of loose booleans — **not** the same thing as `API_STATUS` |
| Toasts | `src/utility/common.ts` | `showToastSuccess` / `showToastError` |
| Store + typed hooks | `src/setup/store.ts` | the store, `useAppDispatch`, `useAppSelector`, `RootState`, `AppDispatch` |
| Slice registration | `src/setup/rootReducer.ts` | where a new slice is registered; also wipes every slice on logout |
| A slice to pattern-match | `src/reducers/authReducer.ts` | named state interface, `ApiStatus`, reset action — the shape yours follows |
| Route shape | `src/routers/routeList.ts` | the `AppRoute` interface and the `routeList` array routes are added to |
| Route guarding | `src/routers/PrivateRoute.tsx`, `src/routers/routerMapper.ts` | auth-then-permission checks wrapped around every mapped route |
| Permissions / sidebar keys | `src/constants/permissions.ts`, `src/constants/sidebarKeys.ts` | the `ScreenPermission` and `SidebarKey` enums every route entry draws from |
| Strings | `src/translations/enTranslation.ts` | `headerTitles`, `labels`, `buttons`, `validation`, `messages` |
| Shared response types | `src/types/common.types.ts` | `ApiEnvelope`, `PaginatedResponse` |

## Stack

- **TypeScript**, `strict` mode — no `any` in feature code; the shared hooks above are the only
  place loose typing is accepted
- **React 18** — function components and hooks only, never class components
- **Ant Design 5** (`antd`) — preferred over hand-rolled UI
- **Formik** + **Zod**, joined by the Zod-Formik adapter
- **Redux Toolkit**, persisted with `redux-persist` to localStorage
- **Axios**
- **react-router-dom v6**
- **Plain CSS** — never CSS-in-JS, Tailwind or styled-components
- **Static translation objects** — every user-facing string, no exceptions

## Folder map

Feature-wise / module-based, all files `.ts` / `.tsx`.

| Folder | Holds |
|---|---|
| `src/api/` | shared cross-module API functions, one file per domain, plus `endpoints.ts` |
| `src/actions/` | redux thunks, one file per domain |
| `src/constants/` | shared constants and enums |
| `src/hooks/` | shared hooks — `useFetchAPI.ts` |
| `src/modules/` | one folder per feature module (subfolders below) |
| `src/reducers/` | one slice per domain, combined in `setup/rootReducer.ts` |
| `src/routers/` | module route arrays, `routeList.ts`, `routerMapper.ts`, `PrivateRoute.tsx`, `AuthenticateRoutes.tsx`, `routes.tsx` |
| `src/setup/` | `store.ts`, `rootReducer.ts`, `client.ts`, `apiStatus.ts`, `i18n.ts` |
| `src/translations/` | `enTranslation.ts` |
| `src/types/` | app-wide shared types |
| `src/utility/` | `common.ts` (toasts), `apiStatus.ts` (HTTP codes), `getBaseURL.ts` |

Inside `src/modules/<module>/`:

| Subfolder | Holds |
|---|---|
| `api/` | this module's own endpoint calls |
| `config/` | column and field configs |
| `css/` | one file per component in the module |
| `forms/` | Formik form components |
| `hooks/` | module hooks wrapping this module's api functions |
| `lists/` | listing and table components |
| `modalPopup/` | modals scoped to this module |
| `schema/` | Zod schemas and their inferred types |
| `types/` | module-local types — props, DTOs |
