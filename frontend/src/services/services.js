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

  async create(serviceData) {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  async update(id, serviceData) {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  async toggleActive(id) {
    const response = await api.patch(`/services/${id}/toggle-active`);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/services/${id}`);
  },
};

