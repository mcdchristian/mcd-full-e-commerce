import axios from 'axios';

const TOKEN_STORAGE_KEY = 'token';

/** Broadcast when the API rejects the stored token, so providers can sign out. */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

// Interceptors also run while Next renders on the server, where `localStorage`
// does not exist, so every access is guarded.
const hasStorage = () => typeof window !== 'undefined';

export const getAuthToken = (): string | null =>
  hasStorage() ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;

export const setAuthToken = (token: string): void => {
  if (hasStorage()) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = (): void => {
  if (hasStorage()) window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Drop a token the API has rejected instead of replaying it on every call.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && getAuthToken()) {
      clearAuthToken();
      if (hasStorage()) {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
