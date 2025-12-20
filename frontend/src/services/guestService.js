import api from './api';

export const guestService = {
  getAll: async (params) => {
    const response = await api.get('/guests', { params });
    return response.data;
  },

  search: async (query) => {
    const response = await api.get('/guests/search', { params: { q: query } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/guests/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/guests', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/guests/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/guests/${id}`);
    return response.data;
  },
};
