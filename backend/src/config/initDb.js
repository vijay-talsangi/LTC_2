/**
 * DB Initialization Script
 * Run: bun run db:init
 * Creates all tables from schema.sql and seeds the admin user.
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from './db.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

async function initDb() {
  const client = await pool.connect();
  try {
    logger.info('🔧 Initializing database schema...');

    const schemaPath = join(__dirname, '../../schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    await client.query(schema);
    logger.info('✅ Schema applied successfully');

    // Seed admin user
    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@ltcc.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existing.rows.length === 0) {
      const hashed = await bcrypt.hash(adminPassword, 12);
      await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        [adminEmail, hashed, 'admin']
      );
      logger.success(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
      logger.info('ℹ️  Admin user already exists – skipping seed');
    }

    logger.success('🎉 Database initialization complete!');
  } catch (error) {
    logger.error('❌ DB initialization failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

initDb();
