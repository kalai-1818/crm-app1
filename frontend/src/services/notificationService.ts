import { apiClient } from './apiClient.ts';

const API_URL = '/api/notifications';

export const notificationService = {
  async getNotifications() {
    return apiClient(API_URL);
  },

  async markAsRead(id: string) {
    return apiClient(`${API_URL}/${id}/read`, {
      method: 'PUT'
    });
  },

  async markAllAsRead() {
    return apiClient(`${API_URL}/read-all`, {
      method: 'PUT'
    });
  }
};
