import api from './api';

export const serviceService = {
  getAll: async (params) => {
    const response = await api.get('/services', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/services', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  addToBooking: async (data) => {
    const response = await api.post('/services/add-to-booking', data);
    return response.data;
  },
};
