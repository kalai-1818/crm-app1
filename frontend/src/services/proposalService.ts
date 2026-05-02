import { apiClient } from './apiClient.ts';

export const proposalService = {
  async getProposals(leadId?: string) {
    const url = leadId ? `/api/proposals?leadId=${leadId}` : '/api/proposals';
    return apiClient(url);
  },
  async getProposal(id: string) {
    return apiClient(`/api/proposals/${id}`);
  }
};
