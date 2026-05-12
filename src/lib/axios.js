import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every outgoing request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Public routes that should NEVER trigger an auto-logout on 401
const PUBLIC_ROUTES = ['/users/suggest', '/users/search', '/auth/user/', '/stats', '/posts'];

// Global response interceptor for error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-clear auth on 401 (expired / invalid token)
    // Skip auto-logout for public endpoints to avoid false logouts
    const requestUrl = error.config?.url || '';
    const isPublicRoute = PUBLIC_ROUTES.some((route) => requestUrl.includes(route));

    if (error.response?.status === 401 && !isPublicRoute) {
      Cookies.remove('token');
      Cookies.remove('user_data');

      // Redirect to login if running in a browser context
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // Normalize error message from backend's new { success, message } format
    // while staying backwards-compatible with the old { msg } format
    if (error.response?.data) {
      const data = error.response.data;
      if (data.message && !data.msg) {
        data.msg = data.message;
      }
    }

    return Promise.reject(error);
  }
);

export default api;