import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Routes
import apiRouter from './routes';
import authRoutes from './routes/auth';
import listsRoutes from './routes/lists';
import itemsRoutes from './routes/items';
import Paths from './common/constants/Paths';

dotenv.config();

const app = express();

// Restrict CORS to allowed origins from environment variable
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use(Paths.Base, apiRouter);
app.use('/api/auth', authRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/items', itemsRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({
      error: err.message || 'Internal Server Error',
      stack: err.stack,
    });
  } else {
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

export default app;
