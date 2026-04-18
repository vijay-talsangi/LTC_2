import jwt from 'jsonwebtoken';

const JWT_SECRET     = process.env.JWT_SECRET     || 'fallback_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT token
 * @param {object} payload
 * @returns {string}
 */
export const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {object} decoded payload
 */
export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
