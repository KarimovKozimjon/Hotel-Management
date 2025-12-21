import api from './api';

const reviewService = {
  getAll: async () => {
    const response = await api.get('/reviews');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  getByBooking: async (bookingId) => {
    const response = await api.get(`/reviews/booking/${bookingId}`);
    return response.data;
  },

  getByGuest: async (guestId) => {
    const response = await api.get(`/reviews/guest/${guestId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

export default reviewService;
