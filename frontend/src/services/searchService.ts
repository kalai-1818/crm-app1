import axios from 'axios';

const api = axios.create({
  baseURL: '/api/search',
  withCredentials: true
});

export interface SearchResult {
  leads: any[];
  tasks: any[];
  users: any[];
}

export const searchService = {
  globalSearch: async (query: string): Promise<SearchResult> => {
    const response = await api.get(`/?q=${query}`);
    return response.data;
  }
};
