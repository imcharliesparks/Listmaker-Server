import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { AuthRequest } from '../types';

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

/**
 * Authentication middleware using Clerk session tokens.
 * Verifies the Bearer token and attaches user info to req.user.
 */
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

    try {
      // Verify Clerk session token
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      if (!payload || !payload.sub) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const userId = payload.sub;

      // Fetch user details from Clerk to get email
      const user = await clerkClient.users.getUser(userId);

      // Get primary email address
      const email = user.emailAddresses.find(
        e => e.id === user.primaryEmailAddressId
      )?.emailAddress;

      if (!email) {
        return res.status(401).json({ error: 'User email not available' });
      }

      // Attach user info to request (maintaining same interface as Firebase)
      (req as AuthRequest).user = {
        uid: userId,
        email,
      };

      next();
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
