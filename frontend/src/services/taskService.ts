import { apiClient } from './apiClient.ts';

const API_URL = '/api/tasks';

export const taskService = {
  async getTasks() {
    return apiClient(API_URL);
  },

  async createTask(taskData: any) {
    return apiClient(API_URL, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(id: string, taskData: any) {
    return apiClient(`${API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  async deleteTask(id: string) {
    return apiClient(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
  }
};
