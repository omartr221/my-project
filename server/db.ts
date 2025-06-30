import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set. Did you forget to provision a database?");
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  } else {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
}

// Add connection error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (process.env.NODE_ENV === "production") {
    // In production, attempt to reconnect rather than crash
    console.log('Attempting to reconnect to database...');
  }
});

export const db = drizzle({ client: pool, schema });