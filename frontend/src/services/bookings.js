import api from './api.js';

export const bookingsApi = {
  async create(bookingData) {
    const response = await api.post('/api/bookings', {
      serviceId: bookingData.serviceId,
      date: bookingData.date,
      time: bookingData.time,
    });
    return response.data;
  },

  async getMy() {
    const response = await api.get('/api/bookings/my');
    return response.data;
  },
};

