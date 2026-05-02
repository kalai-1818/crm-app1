import { apiClient } from './apiClient.ts';

const API_URL = '/api/dashboard';

export const dashboardService = {
  async getStats() {
    return apiClient(API_URL);
  }
};
