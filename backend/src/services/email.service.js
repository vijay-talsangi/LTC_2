import { logger } from '../utils/logger.js';

/**
 * AWS SES email service – STUB
 * Full implementation will be added when SES credentials are configured.
 * All methods log what would have been sent.
 */

export const sendWelcomeEmail = async ({ email, name, role, password }) => {
  logger.info(`[EMAIL STUB] Welcome email → ${email}`);
  logger.info(`[EMAIL STUB] Name: ${name} | Role: ${role} | Default PW: ${password}`);
  // TODO: Replace with actual SES SendEmail call
  return { success: true, stub: true };
};

export const sendAttendanceNotification = async ({ email, name, date, status }) => {
  logger.info(`[EMAIL STUB] Attendance notification → ${email} | Date: ${date} | Status: ${status}`);
  return { success: true, stub: true };
};
