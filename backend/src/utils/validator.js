import { z } from 'zod';

// ─── Schemas ─────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const attendanceSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  records: z
    .array(
      z.object({
        student_id: z.number().int().positive(),
        status:     z.enum(['present', 'absent']),
      })
    )
    .min(1, 'At least one attendance record is required'),
});

export const hierarchySchema = z.object({
  type:      z.enum(['division', 'school', 'department', 'panel']),
  name:      z.string().min(1).max(255),
  parent_id: z.number().int().positive().optional(),
});

// ─── Middleware factory ───────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors:  result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data;
  next();
};
