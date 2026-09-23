import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENDPOINTS } from '../api/endpoints';
import { getBaseURL } from '../utility/getBaseURL';
import { sanitizeInput } from '../utility/sanitize';
import { setAuthTokens, logout } from '../reducers/authReducer';
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

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// Shared so three parallel 401s trigger one refresh, not three.
let refreshPromise: Promise<string> | null = null;

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

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !originalConfig || originalConfig._retried) {
      return Promise.reject(error);
    }

    originalConfig._retried = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }
      const accessToken = await refreshPromise;
      refreshPromise = null;
      originalConfig.headers.set('Authorization', `Bearer ${accessToken}`);
      return client(originalConfig);
    } catch (refreshError) {
      refreshPromise = null;
      dispatch?.(logout());
      return Promise.reject(refreshError);
    }
  },
);

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getState?.().auth.refreshToken;
  const response = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${getBaseURL()}${ENDPOINTS.auth.refresh}`,
    { refreshToken },
  );
  dispatch?.(setAuthTokens(response.data));
  return response.data.accessToken;
};

export default client;
