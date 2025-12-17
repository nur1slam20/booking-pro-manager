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

  async getAll() {
    const response = await api.get('/bookings');
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.put(`/bookings/${id}`, { status });
    return response.data;
  },

  async delete(id) {
    await api.delete(`/bookings/${id}`);
  },
};

