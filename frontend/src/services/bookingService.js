import api from './api';

export const bookingService = {
  getAll: async (params) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  checkIn: async (id) => {
    const response = await api.post(`/bookings/${id}/check-in`);
    return response.data;
  },

  checkOut: async (id) => {
    const response = await api.post(`/bookings/${id}/check-out`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  },
};
