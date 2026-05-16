import axios from 'axios';
import { store } from '@/app/store';
import { clearAuth, setCredentials } from '@/features/authSlice';

/** Ensure production calls hit /api/* (common mistake: backend host without /api suffix). */
function resolveApiBaseUrl(raw) {
  const trimmed = (raw || '/api').trim().replace(/\/$/, '');
  if (!trimmed || trimmed === '/api') return '/api';
  if (trimmed.endsWith('/api')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return `${trimmed}/api`;
  return trimmed;
}

const baseURL = resolveApiBaseUrl(import.meta.env.VITE_API_URL);

if (import.meta.env.PROD && baseURL === '/api') {
  console.warn(
    '[Atlas] VITE_API_URL is not set. On Vercel, set it to your backend URL, e.g. https://your-api.vercel.app/api'
  );
}

if (import.meta.env.PROD && import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.replace(/\/$/, '').endsWith('/api')) {
  console.warn(
    `[Atlas] VITE_API_URL should end with /api (got "${import.meta.env.VITE_API_URL}"). Using "${baseURL}".`
  );
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshing = null;

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = api.post('/auth/refresh').then((res) => {
            store.dispatch(setCredentials({ accessToken: res.data.accessToken }));
            refreshing = null;
          });
        }
        await refreshing;
        const token = store.getState().auth.accessToken;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        refreshing = null;
        store.dispatch(clearAuth());
      }
    }
    return Promise.reject(error);
  }
);

export default api;
