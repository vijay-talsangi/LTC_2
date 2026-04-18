import { query } from '../config/db.js';

/**
 * Upsert multiple attendance records.
 * If a record for (student_id, date) already exists, it updates the status.
 * @param {{ student_id, faculty_id, date, status }[]} records
 */
export const markAttendance = async (records) => {
  const results = [];
  for (const { student_id, faculty_id, date, status } of records) {
    const r = await query(
      `INSERT INTO attendance (student_id, faculty_id, date, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, date)
       DO UPDATE SET status = $4, faculty_id = $2
       RETURNING *`,
      [student_id, faculty_id, date, status]
    );
    results.push(r.rows[0]);
  }
  return results;
};

/**
 * Get all attendance records for a student, optionally filtered by date range.
 */
export const getAttendanceByStudentId = async (student_id, { from, to } = {}) => {
  let sql    = `SELECT a.*, f.name AS faculty_name
                FROM attendance a
                LEFT JOIN faculty f ON a.faculty_id = f.id
                WHERE a.student_id = $1`;
  const params = [student_id];

  if (from && to) {
    sql += ' AND a.date BETWEEN $2 AND $3';
    params.push(from, to);
  }
  sql += ' ORDER BY a.date DESC';

  const r = await query(sql, params);
  return r.rows;
};

/**
 * Get attendance percentage summary for a student.
 */
export const getAttendanceSummary = async (student_id) => {
  const r = await query(
    `SELECT
       COUNT(*)                                                             AS total,
       COUNT(CASE WHEN status = 'present' THEN 1 END)                      AS present_count,
       COUNT(CASE WHEN status = 'absent'  THEN 1 END)                      AS absent_count,
       ROUND(
         COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0
         / NULLIF(COUNT(*), 0), 2
       )                                                                     AS percentage
     FROM attendance
     WHERE student_id = $1`,
    [student_id]
  );
  return r.rows[0];
};

/**
 * Get all students in a panel on a given date, joined with their attendance (if any).
 * Used by faculty to see/pre-fill an attendance sheet.
 */
export const getAttendanceByFacultyAndDate = async (faculty_id, date, panel_id) => {
  const r = await query(
    `SELECT s.id AS student_id, s.name AS student_name, s.email AS student_email,
            a.status, a.id AS attendance_id
     FROM students s
     LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $2 AND a.faculty_id = $1
     WHERE s.panel_id = $3
     ORDER BY s.name`,
    [faculty_id, date, panel_id]
  );
  return r.rows;
};

/**
 * Get recent dates on which a faculty member marked attendance.
 */
export const getFacultyAttendanceDates = async (faculty_id) => {
  const r = await query(
    `SELECT
       date,
       COUNT(*)                                              AS total,
       COUNT(CASE WHEN status = 'present' THEN 1 END)       AS present_count,
       COUNT(CASE WHEN status = 'absent'  THEN 1 END)       AS absent_count
     FROM attendance
     WHERE faculty_id = $1
     GROUP BY date
     ORDER BY date DESC
     LIMIT 30`,
    [faculty_id]
  );
  return r.rows;
};
