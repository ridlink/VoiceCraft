
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import pkg from 'pg';
const { Pool } = pkg;

// Create a connection pool to the database
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10, // Reduced max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased timeout
  keepAlive: true, // Enable keepalive
  keepAliveInitialDelayMillis: 10000,
  retryDelay: 1000, // Time between retries
  maxRetries: 3 // Number of retries
});

// Log database connection status
pool.on('connect', () => {
  console.log('[Database] Connected successfully');
});

pool.on('error', (err) => {
  console.error('[Database] Pool error:', err);
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// For drizzle ORM
const queryClient = postgres(process.env.DATABASE_URL!, {
  ssl: { rejectUnauthorized: false },
  max: 20,
});

// Initialize drizzle with the client
export const db = drizzle(queryClient);
