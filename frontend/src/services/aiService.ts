import { GoogleGenAI } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AIMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const aiService = {
  async chat(message: string, history: AIMessage[] = [], context: string = "") {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: `You are Nexus AI, a sophisticated intelligence assistant for a high-end CRM system. 
          Your tone is technical, sharp, and highly professional, reflecting a "Nexus" aesthetic (minimalist, futuristic, dark mode, high-performance).
          
          Context about the system:
          - The system manages Leads and Tasks.
          - Leads can be New, Contacted, Converted, or Rejected.
          - Tasks have Priority (High, Medium, Low) and Status (Todo, In Progress, Done).
          - The UI uses terminology like "Matrix", "Vector", "Optics", "Synchronize", "Nexus".
          
          Current environment context: ${context}
          
          Your goals:
          1. Help users summarize data if they provide it.
          2. Suggest next actions for leads.
          3. Explain features of the CRM.
          4. Assist with navigation if they ask where things are.
          
          Keep responses concise and formatted with markdown for clarity. Use italics for technical emphasis.`,
          temperature: 0.7,
        }
      });

      return response.text;
    } catch (error) {
      console.error("AI Assistant Error:", error);
      throw error;
    }
  }
};
