import * as XLSX from 'xlsx';
import { sanitize, formatDOBPassword, toISODate } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

// ─── Column Mappings ──────────────────────────────────────────

/**
 * Map of possible Excel header spellings → internal field name (Faculty).
 * Headers are trimmed and matched case-insensitively.
 */
const FACULTY_COL_MAP = {
  'faculty id':        'faculty_id',
  'facultyid':         'faculty_id',
  'faculty name':      'name',
  'name':              'name',
  'email':             'email',
  'email id':          'email',
  'dob':               'dob',
  'date of birth':     'dob',
  'phone':             'phone',
  'mobile':            'phone',
  'phone no':          'phone',
  'division':          'division',
  'school':            'school',
  'department':        'department',
  'panel assigned':    'panel',
  'panel':             'panel',
  'role':              'role',
};

/**
 * Map of possible Excel header spellings → internal field name (Student).
 */
const STUDENT_COL_MAP = {
  'name':              'name',
  'student name':      'name',
  'email':             'email',
  'email id':          'email',
  'dob':               'dob',
  'date of birth':     'dob',
  'division':          'division',
  'school':            'school',
  'department':        'department',
  'panel':             'panel',
  'panel assigned':    'panel',
};

// ─── Helpers ──────────────────────────────────────────────────

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Map a raw xlsx row (keys = header names) to an internal object
 * using a column map. Keys are compared lower-cased.
 */
const mapRow = (rawRow, colMap) => {
  const mapped = {};
  for (const [rawKey, rawVal] of Object.entries(rawRow)) {
    const normalised = rawKey.trim().toLowerCase();
    if (colMap[normalised]) {
      mapped[colMap[normalised]] = sanitize(rawVal);
    }
  }
  return mapped;
};

/**
 * Extract any DOB-like cell value from a raw row, regardless of column name.
 * xlsx cellDates:true returns JS Date objects directly.
 */
const extractDOBRaw = (rawRow) => {
  for (const key of Object.keys(rawRow)) {
    if (/dob|date.?of.?birth/i.test(key)) return rawRow[key];
  }
  return null;
};

// ─── Parsers ──────────────────────────────────────────────────

/**
 * Parse a Faculty Excel sheet.
 * @param {string} filePath - absolute path to uploaded file
 * @returns {{ data: object[], errors: object[] }}
 */
export const parseFacultySheet = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: null,
      raw: true,
    });

    const data   = [];
    const errors = [];

    rawRows.forEach((rawRow, idx) => {
      const rowNum = idx + 2; // 1-indexed + header row
      const row    = mapRow(rawRow, FACULTY_COL_MAP);

      if (!row.name || !row.email) {
        errors.push({ row: rowNum, error: 'Missing required fields: name and/or email' });
        return;
      }

      if (!isValidEmail(row.email)) {
        errors.push({ row: rowNum, error: `Invalid email: ${row.email}` });
        return;
      }

      const dobRaw       = extractDOBRaw(rawRow);
      const dobISO       = toISODate(dobRaw);
      const plainPassword = formatDOBPassword(dobRaw) || 'Password@123';

      data.push({
        ...row,
        email:          row.email.toLowerCase().trim(),
        dob:            dobISO,
        plain_password: plainPassword,
      });
    });

    logger.info(`Faculty sheet parsed → ${data.length} valid, ${errors.length} skipped`);
    return { data, errors };
  } catch (err) {
    logger.error('Excel parse error (faculty):', err.message);
    throw new Error(`Failed to parse faculty sheet: ${err.message}`);
  }
};

/**
 * Parse a Student Excel sheet.
 * @param {string} filePath - absolute path to uploaded file
 * @returns {{ data: object[], errors: object[] }}
 */
export const parseStudentSheet = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: null,
      raw: true,
    });

    const data   = [];
    const errors = [];

    rawRows.forEach((rawRow, idx) => {
      const rowNum = idx + 2;
      const row    = mapRow(rawRow, STUDENT_COL_MAP);

      if (!row.name || !row.email) {
        errors.push({ row: rowNum, error: 'Missing required fields: name and/or email' });
        return;
      }

      if (!isValidEmail(row.email)) {
        errors.push({ row: rowNum, error: `Invalid email: ${row.email}` });
        return;
      }

      const dobRaw        = extractDOBRaw(rawRow);
      const dobISO        = toISODate(dobRaw);
      const plainPassword = formatDOBPassword(dobRaw) || 'Password@123';

      data.push({
        ...row,
        email:          row.email.toLowerCase().trim(),
        dob:            dobISO,
        plain_password: plainPassword,
      });
    });

    logger.info(`Student sheet parsed → ${data.length} valid, ${errors.length} skipped`);
    return { data, errors };
  } catch (err) {
    logger.error('Excel parse error (student):', err.message);
    throw new Error(`Failed to parse student sheet: ${err.message}`);
  }
};
