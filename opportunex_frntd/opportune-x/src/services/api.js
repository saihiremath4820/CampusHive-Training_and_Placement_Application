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
    // If unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh access token using the refresh token cookie
        await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        // Retry the original request (now with the new access token cookie)
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, the session is truly dead
        console.error("Session expired, please re-login.");
        // We handle actual redirection in App.jsx or via logout
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
