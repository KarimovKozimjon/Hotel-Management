import api from './api';

const roomImageService = {
  // Get all images for a room
  getImages: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/images`);
    return response.data;
  },

  // Upload new image
  uploadImage: async (roomId, formData) => {
    const response = await api.post(`/rooms/${roomId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update image metadata
  updateImage: async (roomId, imageId, data) => {
    const response = await api.put(`/rooms/${roomId}/images/${imageId}`, data);
    return response.data;
  },

  // Delete image
  deleteImage: async (roomId, imageId) => {
    const response = await api.delete(`/rooms/${roomId}/images/${imageId}`);
    return response.data;
  },

  // Set primary image
  setPrimary: async (roomId, imageId) => {
    const response = await api.post(`/rooms/${roomId}/images/${imageId}/set-primary`);
    return response.data;
  },

  // Reorder images
  reorderImages: async (roomId, images) => {
    const response = await api.post(`/rooms/${roomId}/images/reorder`, { images });
    return response.data;
  },
};

export default roomImageService;
