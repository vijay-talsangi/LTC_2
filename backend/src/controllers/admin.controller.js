import bcrypt from 'bcryptjs';
import fs from 'fs';

import { parseFacultySheet, parseStudentSheet } from '../services/excel.service.js';
import { sendWelcomeEmail } from '../services/email.service.js';
import { createUser, findUserByEmail } from '../models/user.model.js';
import { createFaculty, getAllFaculty, getTotalFaculty } from '../models/faculty.model.js';
import { createStudent, getAllStudents, getTotalStudents } from '../models/student.model.js';
import {
  findOrCreateDivision,
  findOrCreateSchool,
  findOrCreateDepartment,
  findOrCreatePanel,
  getHierarchyTree,
  getAllPanels,
} from '../models/hierarchy.model.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/error.middleware.js';

// ─── Dashboard ────────────────────────────────────────────────

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalStudents, totalFaculty, panels, hierarchy] = await Promise.all([
      getTotalStudents(),
      getTotalFaculty(),
      getAllPanels(),
      getHierarchyTree(),
    ]);

    res.json({
      success: true,
      data: { totalStudents, totalFaculty, totalPanels: panels.length, hierarchy },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Upload Faculty Sheet ─────────────────────────────────────

export const uploadFacultySheet = async (req, res, next) => {
  const filePath = req.file?.path;
  try {
    if (!filePath) throw new AppError('No file uploaded', 400);

    const { data, errors } = parseFacultySheet(filePath);
    const results = { inserted: 0, skipped: 0, failed: [], parseErrors: errors };

    for (const row of data) {
      try {
        // Skip if user already exists
        const existingUser = await findUserByEmail(row.email);
        if (existingUser) { results.skipped++; continue; }

        // Ensure hierarchy (creates nodes if they don't exist)
        const division   = await findOrCreateDivision(row.division   || 'General');
        const school     = await findOrCreateSchool    (row.school     || 'General', division.id);
        const department = await findOrCreateDepartment(row.department || 'General', school.id);
        const panel      = await findOrCreatePanel      (row.panel      || 'General', department.id);

        // Hash DOB-based default password
        const hashedPassword = await bcrypt.hash(row.plain_password, 12);

        // Create auth user
        const user = await createUser({ email: row.email, password: hashedPassword, role: 'faculty' });

        // Create faculty record
        await createFaculty({
          user_id:    user.id,
          faculty_id: row.faculty_id,
          name:       row.name,
          email:      row.email,
          dob:        row.dob,
          phone:      row.phone,
          division:   row.division,
          school:     row.school,
          department: row.department,
          panel:      row.panel,
          panel_id:   panel.id,
          role:       row.role,
        });

        // Send welcome email (stubbed)
        await sendWelcomeEmail({
          email:    row.email,
          name:     row.name,
          role:     'Faculty',
          password: row.plain_password,
        });

        results.inserted++;
        logger.success(`Faculty created: ${row.email} (PW: ${row.plain_password})`);
      } catch (rowErr) {
        logger.error(`Row error (${row.email}): ${rowErr.message}`);
        results.failed.push({ email: row.email, error: rowErr.message });
      }
    }

    fs.unlinkSync(filePath); // Clean up temp file

    res.json({
      success: true,
      message: `Faculty upload complete: ${results.inserted} inserted, ${results.skipped} skipped`,
      data:    results,
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    next(error);
  }
};

// ─── Upload Student Sheet ─────────────────────────────────────

export const uploadStudentSheet = async (req, res, next) => {
  const filePath = req.file?.path;
  try {
    if (!filePath) throw new AppError('No file uploaded', 400);

    const { data, errors } = parseStudentSheet(filePath);
    const results = { inserted: 0, skipped: 0, failed: [], parseErrors: errors };

    for (const row of data) {
      try {
        const existingUser = await findUserByEmail(row.email);
        if (existingUser) { results.skipped++; continue; }

        const division   = await findOrCreateDivision(row.division   || 'General');
        const school     = await findOrCreateSchool    (row.school     || 'General', division.id);
        const department = await findOrCreateDepartment(row.department || 'General', school.id);
        const panel      = await findOrCreatePanel      (row.panel      || 'General', department.id);

        const hashedPassword = await bcrypt.hash(row.plain_password, 12);

        const user = await createUser({ email: row.email, password: hashedPassword, role: 'student' });

        await createStudent({
          user_id:    user.id,
          name:       row.name,
          email:      row.email,
          dob:        row.dob,
          division:   row.division,
          school:     row.school,
          department: row.department,
          panel:      row.panel,
          panel_id:   panel.id,
        });

        await sendWelcomeEmail({
          email:    row.email,
          name:     row.name,
          role:     'Student',
          password: row.plain_password,
        });

        results.inserted++;
        logger.success(`Student created: ${row.email} (PW: ${row.plain_password})`);
      } catch (rowErr) {
        logger.error(`Row error (${row.email}): ${rowErr.message}`);
        results.failed.push({ email: row.email, error: rowErr.message });
      }
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Student upload complete: ${results.inserted} inserted, ${results.skipped} skipped`,
      data:    results,
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    next(error);
  }
};

// ─── List endpoints ───────────────────────────────────────────

export const getFacultyList = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const result = await getAllFaculty({ page: +page, limit: +limit, search });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getStudentList = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const result = await getAllStudents({ page: +page, limit: +limit, search });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getHierarchy = async (req, res, next) => {
  try {
    const tree = await getHierarchyTree();
    res.json({ success: true, data: tree });
  } catch (error) { next(error); }
};

export const getPanels = async (req, res, next) => {
  try {
    const panels = await getAllPanels();
    res.json({ success: true, data: panels });
  } catch (error) { next(error); }
};

// ─── Create hierarchy node ────────────────────────────────────

export const createHierarchyNode = async (req, res, next) => {
  try {
    const { type, name, parent_id } = req.body;
    let result;

    switch (type) {
      case 'division':
        result = await findOrCreateDivision(name); break;
      case 'school':
        if (!parent_id) throw new AppError('division_id (parent_id) is required for school', 400);
        result = await findOrCreateSchool(name, parent_id); break;
      case 'department':
        if (!parent_id) throw new AppError('school_id (parent_id) is required for department', 400);
        result = await findOrCreateDepartment(name, parent_id); break;
      case 'panel':
        if (!parent_id) throw new AppError('department_id (parent_id) is required for panel', 400);
        result = await findOrCreatePanel(name, parent_id); break;
      default:
        throw new AppError('Invalid hierarchy type', 400);
    }

    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
};
