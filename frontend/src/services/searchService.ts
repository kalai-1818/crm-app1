import { apiClient } from './apiClient.ts';

export interface SearchResult {
  leads: any[];
  tasks: any[];
  users: any[];
}

export const searchService = {
  globalSearch: async (query: string): Promise<SearchResult> => {
    return apiClient(`/api/search/?q=${encodeURIComponent(query)}`);
  }
};
