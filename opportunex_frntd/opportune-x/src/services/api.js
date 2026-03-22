import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
  withCredentials: true,
});

// Interceptor for auto token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If server restarted — go straight to login, no retry:
    if (error.response?.data?.code === 'SERVER_RESTARTED') {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Normal 401 — try refresh once:
    if (error.response?.status === 401
      && !originalRequest._retry
      && !originalRequest.url?.includes('/auth/refresh-token')) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh-token');
        return api(originalRequest);
      } catch {
        // Refresh failed — go to login silently
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
