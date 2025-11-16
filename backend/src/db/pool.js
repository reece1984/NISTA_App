/**
 * PostgreSQL Connection Pool
 * Uses the same database that N8N connects to
 * Connection pooling for better performance
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if cannot connect
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection on startup (non-blocking)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('⚠️  Initial database connection test failed:', err.message);
    console.error('⚠️  Server will continue running. Database connections will be attempted per-request.');
  } else {
    console.log('✅ Database connected successfully');
    console.log(`📅 Server time: ${res.rows[0].now}`);
  }
});

export default pool;
