import { logger } from '../utils/logger.js';

// ─── Custom Error Class ─────────────────────────────────────
export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name   = 'AppError';
  }
}

// ─── Global Error Handler ───────────────────────────────────
// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, _req, res, _next) => {
  logger.error(`[${err.name}] ${err.message}`);

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with that value already exists',
    });
  }

  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
