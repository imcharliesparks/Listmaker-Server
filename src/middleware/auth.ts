import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { AuthRequest } from '../types';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to request
    (req as AuthRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
