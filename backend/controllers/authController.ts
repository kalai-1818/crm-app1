import { Request, Response } from 'express';
import User from '../models/User.ts';

// Auth is handled entirely by Firebase Auth on the frontend.
// These endpoints handle profile sync and retrieval only.

export const register = async (req: Request, res: Response) => {
  // Registration is done client-side via Firebase Auth SDK.
  // This endpoint is kept for backward compatibility but is not the primary flow.
  res.status(200).json({ message: 'Use Firebase Auth SDK on the client to register.' });
};

export const login = async (req: Request, res: Response) => {
  // Login is done client-side via Firebase Auth SDK.
  res.status(200).json({ message: 'Use Firebase Auth SDK on the client to login.' });
};

export const logout = async (req: Request, res: Response) => {
  // Firebase token invalidation is client-side; nothing to clear server-side.
  res.json({ message: 'Logged out' });
};

export const refreshToken = async (req: Request, res: Response) => {
  // Firebase handles token refresh automatically on the client.
  res.status(200).json({ message: 'Use Firebase Auth SDK for token refresh.' });
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

