
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import pkg from 'pg';
const { Pool } = pkg;

// Create a connection pool to the database
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Disable SSL for local development
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// For drizzle ORM
const queryClient = postgres(process.env.DATABASE_URL!, {
  ssl: false, // Disable SSL for local development
  max: 20,
});

// Initialize drizzle with the client
export const db = drizzle(queryClient);
