import { apiClient } from './apiClient.ts';

const API_URL = '/api/leads';

export const leadService = {
  async getLeads() {
  const data = await apiClient(API_URL);
  // Handle both paginated { leads: [] } and plain array responses
  return Array.isArray(data) ? data : (data.leads || []);
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
