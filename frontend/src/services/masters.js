import api from './api.js';

export const mastersApi = {
  async getAll(page = 1, limit = 100, serviceId = null) {
    let url = `/masters?page=${page}&limit=${limit}`;
    if (serviceId) {
      url += `&serviceId=${serviceId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/masters/${id}`);
    return response.data;
  },

  async getDetails(id) {
    const response = await api.get(`/masters/${id}/details`);
    return response.data;
  },

  async getTimeSlots(id, date, duration = 60) {
    const response = await api.get(`/masters/${id}/time-slots?date=${date}&duration=${duration}`);
    return response.data;
  },

  async checkAvailability(id, date, time) {
    const response = await api.get(`/masters/${id}/availability?date=${date}&time=${time}`);
    return response.data;
  },

  async create(masterData) {
    const response = await api.post('/masters', masterData);
    return response.data;
  },

  async update(id, masterData) {
    const response = await api.put(`/masters/${id}`, masterData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/masters/${id}`);
  },
};

