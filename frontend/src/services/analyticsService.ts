import { apiClient } from './apiClient.ts';

const API_URL = '/api/analytics';

export const analyticsService = {
  async getAnalytics() {
    return apiClient(API_URL);
  }
};
