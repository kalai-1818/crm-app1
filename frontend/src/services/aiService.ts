import { apiClient } from './apiClient.ts';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const aiService = {
  async ask(prompt: string): Promise<string> {
    const response = await apiClient('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    return response.text;
  },
};