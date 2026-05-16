import axios from 'axios';
import { store } from '@/app/store';
import { clearAuth, setCredentials } from '@/features/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
