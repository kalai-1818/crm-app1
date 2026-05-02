import { apiClient } from './apiClient.ts';

export const serviceService = {
  async getServices() {
    return apiClient('/api/services');
  },
  async createService(data: any) {
    return apiClient('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
