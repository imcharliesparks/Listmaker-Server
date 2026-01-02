import { Request } from 'express';

export interface User {
  id: string; // Clerk User ID (format: user_xxxxx)
  email: string;
  display_name?: string;
  photo_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface List {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  cover_image?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Item {
  id: number;
  list_id: number;
  url: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  source_type?: string;
  metadata?: any;
  position: number;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Express request with authenticated user context.
 * user.uid contains Clerk User ID (format: user_xxxxx)
 */
export interface AuthRequest extends Request {
  user?: {
    uid: string, // Clerk User ID
    email?: string,
  };
}

export interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  sourceType?: string;
  metadata?: any;
}
