import api from './api.js';

export const servicesApi = {
  async getAll(page = 1, limit = 100) {
    const response = await api.get(`/services?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
};

