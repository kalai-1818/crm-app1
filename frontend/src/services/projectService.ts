import { apiClient } from './apiClient.ts';

export const projectService = {
  async getProjects(leadId?: string) {
    const url = leadId ? `/api/projects?leadId=${leadId}` : '/api/projects';
    return apiClient(url);
  },
  async updateProject(id: string, data: any) {
    return apiClient(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};
