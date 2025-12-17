import api from './api.js';

export const usersApi = {
  async getAll() {
    const response = await api.get('/users');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/users/${id}`);
  },
};


