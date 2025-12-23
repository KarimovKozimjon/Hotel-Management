import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // For guest routes, use guest token
    if (config.url.startsWith('/guest/')) {
      const guestToken = localStorage.getItem('guestToken');
      if (guestToken) {
        config.headers.Authorization = `Bearer ${guestToken}`;
      }
    } else {
      // For staff routes, use staff token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if it's a guest route
      if (error.config?.url?.startsWith('/guest/')) {
        localStorage.removeItem('guestToken');
        localStorage.removeItem('guest');
        window.location.href = '/guest/login';
      } else {
        // Staff route
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
