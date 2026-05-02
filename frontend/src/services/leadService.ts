import { apiClient } from './apiClient.ts';

const API_URL = '/api/leads';

export const leadService = {
  async getLeads() {
    return apiClient(API_URL);
  },

  async createLead(leadData: any) {
    return apiClient(API_URL, {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  async updateLead(id: string, leadData: any) {
    return apiClient(`${API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  },

  async deleteLead(id: string) {
    return apiClient(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
  },

  async getActivities(id: string) {
    return apiClient(`${API_URL}/${id}/activities`);
  },
  async addComment(id: string, text: string) {
    return apiClient(`${API_URL}/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
};
