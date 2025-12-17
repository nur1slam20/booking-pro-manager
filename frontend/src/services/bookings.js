import api from './api.js';

export const bookingsApi = {
  async create(bookingData) {
    const response = await api.post('/bookings', {
      serviceId: bookingData.serviceId,
      date: bookingData.date,
      time: bookingData.time,
    });
    return response.data;
  },

  async getMy() {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  async getMyStats() {
    const response = await api.get('/bookings/my/stats');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async getAll() {
    const response = await api.get('/bookings');
    return response.data;
  },

  async getAdminStats() {
    const response = await api.get('/bookings/admin/stats');
    return response.data;
  },

  async updateStatus(id, status, adminComment = null) {
    const response = await api.put(`/bookings/${id}/status`, { 
      status,
      adminComment,
    });
    return response.data;
  },

  async delete(id) {
    await api.delete(`/bookings/${id}`);
  },
};

