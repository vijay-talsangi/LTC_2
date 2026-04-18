import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  logger.info('📦 Connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  logger.error('💥 Unexpected DB error:', err.message);
});

/**
 * Execute a parameterised query
 * @param {string} text - SQL query string
 * @param {any[]} [params] - Query parameters
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query (${duration}ms) rows=${result.rowCount}`);
    return result;
  } catch (error) {
    logger.error('DB Query Error:', error.message);
    throw error;
  }
};

export const getClient = () => pool.connect();

export default pool;
