import app from './app';
import { disconnectPrisma } from './config/prisma';

const PORT = process.env.PORT ?? 3001;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
});
