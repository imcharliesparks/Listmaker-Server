import { Response } from 'express';
import { AuthRequest } from '../types';
import pool from '../config/database';

export const syncUser = async (req: AuthRequest, res: Response) => {
  try {
    const { uid, email } = req.user!;
    const { displayName, photoUrl } = req.body;

    // Insert or update user
    const query = `
      INSERT INTO users (id, email, display_name, photo_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id)
      DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        photo_url = EXCLUDED.photo_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [uid, email, displayName, photoUrl]);

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
