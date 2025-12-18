import api from './api.js';

export const aiApi = {
  async getRecommendations() {
    const response = await api.get('/ai/recommendations');
    return response.data;
  },
};

