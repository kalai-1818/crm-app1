import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.ts';
import User from '../models/User.ts';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    let user = await User.findById(decodedToken.uid);

    // Auto-create profile if authenticated in Firebase but not yet in Firestore
    if (!user) {
      const firebaseUser = await auth.getUser(decodedToken.uid);
      user = await User.createWithId(decodedToken.uid, {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        role: 'user',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};
