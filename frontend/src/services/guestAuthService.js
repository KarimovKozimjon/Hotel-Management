import api from './api';

export const guestAuthService = {
  register: async (data) => {
    const response = await api.post('/guest/register', data);
    if (response.data.token) {
      localStorage.setItem('guestToken', response.data.token);
      localStorage.setItem('guest', JSON.stringify(response.data.guest));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/guest/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('guestToken', response.data.token);
      localStorage.setItem('guest', JSON.stringify(response.data.guest));
    }
    return response.data;
  },

  logout: async () => {
    const token = localStorage.getItem('guestToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await api.post('/guest/logout');
    }
    localStorage.removeItem('guestToken');
    localStorage.removeItem('guest');
  },

  getCurrentGuest: () => {
    const guestStr = localStorage.getItem('guest');
    if (guestStr) {
      return JSON.parse(guestStr);
    }
    return null;
  },

  getToken: () => {
    return localStorage.getItem('guestToken');
  },
};
