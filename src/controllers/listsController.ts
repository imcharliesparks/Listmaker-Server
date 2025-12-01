import { Response } from 'express';
import { AuthRequest } from '../types';
import pool from '../config/database';

export const createList = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { title, description, isPublic } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const query = `
      INSERT INTO lists (user_id, title, description, is_public)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [uid, title, description, isPublic || false]);

    res.status(201).json({ list: result.rows[0] });
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
};

export const getUserLists = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;

    const query = `
      SELECT l.*, COUNT(i.id) as item_count
      FROM lists l
      LEFT JOIN items i ON l.id = i.list_id
      WHERE l.user_id = $1
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `;

    const result = await pool.query(query, [uid]);

    res.json({ lists: result.rows });
  } catch (error) {
    console.error('Error getting lists:', error);
    res.status(500).json({ error: 'Failed to get lists' });
  }
};

export const getListById = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;

    const query = `
      SELECT * FROM lists
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [id, uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ list: result.rows[0] });
  } catch (error) {
    console.error('Error getting list:', error);
    res.status(500).json({ error: 'Failed to get list' });
  }
};

export const updateList = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;
    const { title, description, isPublic } = req.body;

    const query = `
      UPDATE lists
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          is_public = COALESCE($3, is_public)
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [title, description, isPublic, id, uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ list: result.rows[0] });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
};

export const deleteList = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM lists WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
};
