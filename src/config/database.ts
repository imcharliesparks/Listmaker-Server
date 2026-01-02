import {Pool, PoolConfig} from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

let config: PoolConfig;

// Check for the standard connection string (recommended for Neon)
if (process.env.DATABASE_URL) {
  config = {
    // The pg library will automatically parse the host, user, password, etc., from this string.
    connectionString: process.env.DATABASE_URL,

    // 💡 IMPORTANT: Neon requires SSL. This configuration tells the pg library to use it.
    ssl: {
      // Set this to false for development environments,
      // as your local machine might not recognize Neon's root certificate.
      // NOTE: For production, you should aim to keep rejectUnauthorized: true.
      rejectUnauthorized: false,
    },
  };
} else {
  // This block is the fallback for your original separate parameters (DB_HOST, etc.)
  config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

const pool = new Pool(config);

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

export default pool;