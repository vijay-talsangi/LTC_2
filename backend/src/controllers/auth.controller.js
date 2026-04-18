import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../models/user.model.js';
import { findFacultyByUserId } from '../models/faculty.model.js';
import { findStudentByUserId } from '../models/student.model.js';
import { signToken } from '../config/jwt.js';
import { formatDOBPassword } from '../utils/helpers.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

const buildPasswordCandidates = (password) => {
  const candidates = new Set();
  const plain = String(password || '').trim();
  if (plain) candidates.add(plain);

  const normalizedFromDate = formatDOBPassword(plain);
  if (normalizedFromDate) candidates.add(normalizedFromDate);

  const compactDigits = plain.replace(/\D/g, '');
  if (compactDigits.length === 8) {
    candidates.add(compactDigits);
  }

  return [...candidates];
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const passwordCandidates = buildPasswordCandidates(password);
    let isMatch = false;

    for (const candidate of passwordCandidates) {
      // Stop after first valid password candidate.
      if (await bcrypt.compare(candidate, user.password)) {
        isMatch = true;
        break;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Fetch role-specific profile
    let profile = null;
    if (user.role === 'faculty') {
      profile = await findFacultyByUserId(user.id);
    } else if (user.role === 'student') {
      profile = await findStudentByUserId(user.id);
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    logger.info(`✅ Login: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user:    { id: user.id, email: user.email, role: user.role },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await findUserByEmail(req.user.email);
    if (!user) throw new AppError('User not found', 404);

    let profile = null;
    if (user.role === 'faculty') {
      profile = await findFacultyByUserId(user.id);
    } else if (user.role === 'student') {
      profile = await findStudentByUserId(user.id);
    }

    res.json({
      success: true,
      data: {
        user:    { id: user.id, email: user.email, role: user.role },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};
