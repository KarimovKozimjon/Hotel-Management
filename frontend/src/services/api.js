import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getBackendOrigin = () => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return 'http://localhost:8000';
  }
};

export const resolveAssetUrl = (value) => {
  if (!value || typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  // Already absolute or a data URL
  if (/^(https?:)?\/\//i.test(trimmed) || /^data:/i.test(trimmed)) return trimmed;

  const origin = getBackendOrigin();

  // Laravel Storage::url() usually returns /storage/...
  if (trimmed.startsWith('/')) return `${origin}${trimmed}`;
  if (trimmed.startsWith('storage/')) return `${origin}/${trimmed}`;

  return trimmed;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthContext = (config) => {
  const raw = config?.headers?.['X-Auth-Context'] ?? config?.headers?.['x-auth-context'];
  if (typeof raw === 'string') return raw.toLowerCase();
  return null;
};

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const authContext = getAuthContext(config);

    // For guest routes (or explicitly guest-marked requests), use guest token
    if (config.url.startsWith('/guest/') || authContext === 'guest') {
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
      const authContext = getAuthContext(error.config);
      // Check if it's a guest route
      if (error.config?.url?.startsWith('/guest/') || authContext === 'guest') {
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
