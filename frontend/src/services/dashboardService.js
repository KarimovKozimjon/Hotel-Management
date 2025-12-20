import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  getRevenue: async (period = 'month') => {
    const response = await api.get('/dashboard/revenue', { params: { period } });
    return response.data;
  },
};
