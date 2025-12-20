import api from './api';

export const roomService = {
  getAll: async (params) => {
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  getAvailable: async (checkInDate, checkOutDate, roomTypeId) => {
    const response = await api.get('/rooms/available', {
      params: { check_in_date: checkInDate, check_out_date: checkOutDate, room_type_id: roomTypeId }
    });
    return response.data;
  },
};

export const roomTypeService = {
  getAll: async () => {
    const response = await api.get('/room-types');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/room-types/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/room-types', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/room-types/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/room-types/${id}`);
    return response.data;
  },
};
