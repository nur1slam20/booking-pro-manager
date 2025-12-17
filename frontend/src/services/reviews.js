import api from './api.js';

export const reviewsApi = {
  async getAll(page = 1, limit = 100, masterId = null, serviceId = null) {
    let url = `/reviews?page=${page}&limit=${limit}`;
    if (masterId) {
      url += `&masterId=${masterId}`;
    }
    if (serviceId) {
      url += `&serviceId=${serviceId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  async getAverageRating(masterId = null, serviceId = null) {
    let url = '/reviews/average';
    const params = [];
    if (masterId) params.push(`masterId=${masterId}`);
    if (serviceId) params.push(`serviceId=${serviceId}`);
    if (params.length > 0) url += '?' + params.join('&');
    
    const response = await api.get(url);
    return response.data;
  },

  async create(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  async update(id, reviewData) {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/reviews/${id}`);
  },
};

