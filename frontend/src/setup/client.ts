import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENDPOINTS } from '../api/endpoints';
import { getBaseURL } from '../utility/getBaseURL';
import { store } from './store';
import { setAuthTokens, logout } from '../reducers/authReducer';

// The only place axios is imported in the app — every request goes through here
// so it always gets the base URL, the auth header, and the refresh retry.
const client = axios.create({
  baseURL: getBaseURL(),
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// A single in-flight refresh promise so three parallel 401s trigger one refresh
// rather than three that race and invalidate each other.
let refreshPromise: Promise<string> | null = null;

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
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

    // Marked before awaiting, so a failing refresh can't loop this request forever.
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
      store.dispatch(logout());
      return Promise.reject(refreshError);
    }
  },
);

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = store.getState().auth;
  const response = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${getBaseURL()}${ENDPOINTS.auth.refresh}`,
    { refreshToken },
  );
  store.dispatch(setAuthTokens(response.data));
  return response.data.accessToken;
}

export default client;
