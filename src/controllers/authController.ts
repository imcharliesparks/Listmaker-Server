import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/prisma';

const serializeUser = (user: any) => ({
  id: user.id,
  email: user.email,
  display_name: user.displayName ?? null,
  photo_url: user.photoUrl ?? null,
  created_at: user.createdAt,
  updated_at: user.updatedAt,
});

export const syncUser = async (req: AuthRequest, res: Response) => {
  try {
    const { uid, email } = req.user!;
    const { displayName, photoUrl } = req.body;
    if (!email) {
      return res.status(401).json({ error: 'User email not available' });
    }

    const user = await prisma.user.upsert({
      where: { id: uid },
      create: {
        id: uid,
        email,
        displayName: displayName ?? null,
        photoUrl: photoUrl ?? null,
      },
      update: {
        email,
        displayName: displayName ?? null,
        photoUrl: photoUrl ?? null,
        updatedAt: new Date(),
      },
    });

    res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;

    const user = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
