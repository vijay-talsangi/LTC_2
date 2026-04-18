import { query } from '../config/db.js';

export const findUserByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await query(
    'SELECT id, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const createUser = async ({ email, password, role }) => {
  const result = await query(
    `INSERT INTO users (email, password, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role, created_at`,
    [email, password, role]
  );
  return result.rows[0];
};

export const updateUserPassword = async (id, hashedPassword) => {
  const result = await query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, email',
    [hashedPassword, id]
  );
  return result.rows[0];
};
