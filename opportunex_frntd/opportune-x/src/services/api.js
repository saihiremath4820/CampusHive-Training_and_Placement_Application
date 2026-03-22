import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
  withCredentials: true,
});

// Track refresh attempts globally — prevents parallel/recursive refresh loops
let isRefreshing = false;

// Interceptor for auto token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If server restarted — go straight to login immediately:
    if (error.response?.data?.code === 'SERVER_RESTARTED') {
      isRefreshing = false;
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Only retry on 401 AND only if not already retrying AND not a refresh request:
    const isRefreshRequest = originalRequest.url?.includes('refresh-token')
      || originalRequest._isRefreshRequest === true;

    if (error.response?.status === 401
      && !originalRequest._retry
      && !isRefreshRequest
      && !isRefreshing) {

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Mark the refresh request itself so it never re-enters this block:
        await api.post('/auth/refresh-token', {}, {
          _isRefreshRequest: true
        });
        isRefreshing = false;
        return api(originalRequest);
      } catch {
        // Refresh failed — stop everything and go to login:
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // For all other errors including failed refresh — just reject:
    return Promise.reject(error);
  }
);

export default api;
