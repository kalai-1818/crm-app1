import { Router } from 'express';
import { protect } from '../middleware/auth.ts';
import { GoogleGenAI } from '@google/genai';
import { Request, Response } from 'express';

const router = Router();

router.post('/ask', protect, async (req: any, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    res.json({ text: result.text });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;