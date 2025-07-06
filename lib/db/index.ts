import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a Neon postgres connection string');
}

// Create the connection using Neon's serverless driver
const sql = neon(process.env.DATABASE_URL);

// Create the Drizzle instance
export const db = drizzle(sql, { schema });

// Export the connection for direct SQL queries if needed
export { sql }; 