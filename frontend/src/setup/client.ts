import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { sanitizeInput } from '../utility/sanitize';
import { getBaseURL } from '../utility/getBaseURL';
import { logout } from '../reducers/authReducer';
import type { AppDispatch, RootState } from './store';

const client = axios.create({
  baseURL: getBaseURL(),
});

// setup/store.ts calls injectStore(store) right after creating it. A plain
// `import { store } from './store'` here would create a real runtime import
// cycle (store -> rootReducer -> authReducer -> this file -> store); only the
// TYPES are imported above, which `import type` erases at compile time.
let getState: (() => RootState) | null = null;
let dispatch: AppDispatch | null = null;

export const injectStore = (storeInstance: {
  getState: () => RootState;
  dispatch: AppDispatch;
}): void => {
  getState = storeInstance.getState;
  dispatch = storeInstance.dispatch;
};

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getState?.().auth.accessToken;
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  // FormData is left alone — sanitizeInput's `for...in` can't see into it,
  // so running it through would silently replace an upload with `{}`.
  if (config.data && !(config.data instanceof FormData)) {
    config.data = sanitizeInput(config.data);
  }
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }
  if (config.params) {
    config.params = sanitizeInput(config.params);
  }
  return config;
});

interface FastApiValidationError {
  loc?: Array<string | number>;
  msg?: string;
}

// FastAPI's error body is {"detail": "message"} for a raised HTTPException, or
// {"detail": [{"loc": [...], "msg": ...}, ...]} for a 422 validation error —
// neither shape is what useFetchAPI reads (data.message / data.error). This
// normalizes both into a plain `message` (and `error`, for the same reason)
// so every existing and future module's error toast shows the real reason
// instead of nothing, without each one having to know about `detail`.
const normalizeFastApiError = (error: AxiosError): void => {
  const data = error.response?.data;
  if (!data || typeof data !== 'object' || !('detail' in data)) {
    return;
  }

  const detail = (data as { detail: unknown }).detail;
  const message = Array.isArray(detail)
    ? (detail as FastApiValidationError[])
        .map((item) => item.msg)
        .filter(Boolean)
        .join('; ')
    : typeof detail === 'string'
      ? detail
      : undefined;

  if (message) {
    (data as Record<string, unknown>).message = message;
    (data as Record<string, unknown>).error = message;
  }
};

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    normalizeFastApiError(error);

    // The backend has no refresh-token endpoint — a 401 always means "not
    // authenticated" (bad credentials on login, or an expired/invalid token
    // on a protected route), never "briefly retry with a new token". Either
    // way the session is gone, so clear it; the login screen shows the
    // login-attempt's own error message via the toast above, unaffected by
    // this reset since it's a plain reducer action, not a redirect.
    if (error.response?.status === 401) {
      dispatch?.(logout());
    }
    return Promise.reject(error);
  },
);

export default client;
