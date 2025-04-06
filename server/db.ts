import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import pkg from 'pg';
const { Pool } = pkg;

// Create a connection pool to the database
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// For drizzle ORM
const queryClient = postgres(process.env.DATABASE_URL!);

// Initialize drizzle with the client
export const db = drizzle(queryClient);