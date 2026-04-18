import { query } from '../config/db.js';

export const createStudent = async (data) => {
  const { user_id, name, email, dob, division, school, department, panel, panel_id } = data;
  const result = await query(
    `INSERT INTO students (user_id, name, email, dob, division, school, department, panel, panel_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [user_id, name, email, dob, division, school, department, panel, panel_id]
  );
  return result.rows[0];
};

export const findStudentByEmail = async (email) => {
  const r = await query('SELECT * FROM students WHERE email = $1', [email]);
  return r.rows[0] || null;
};

export const findStudentByUserId = async (user_id) => {
  const r = await query(
    `SELECT s.*,
            f.name   AS faculty_name,
            f.email  AS faculty_email,
            p.name   AS panel_name,
            d.name   AS department_name,
            sch.name AS school_name,
            div.name AS division_name
     FROM students s
     LEFT JOIN panels      p   ON s.panel_id = p.id
     LEFT JOIN faculty     f   ON f.panel_id = s.panel_id
     LEFT JOIN departments d   ON p.department_id = d.id
     LEFT JOIN schools     sch ON d.school_id = sch.id
     LEFT JOIN divisions   div ON sch.division_id = div.id
     WHERE s.user_id = $1
     LIMIT 1`,
    [user_id]
  );
  return r.rows[0] || null;
};

export const getStudentsByPanel = async (panel_id) => {
  const r = await query(
    `SELECT s.*, u.email AS login_email
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.panel_id = $1
     ORDER BY s.name`,
    [panel_id]
  );
  return r.rows;
};

export const getAllStudents = async ({ page = 1, limit = 50, search = '' } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = '';

  if (search) {
    where = 'WHERE s.name ILIKE $1 OR s.email ILIKE $1';
    params.push(`%${search}%`, limit, offset);
  } else {
    params.push(limit, offset);
  }

  const [l, o] = search ? [2, 3] : [1, 2];

  const data = await query(
    `SELECT s.*, p.name AS panel_name_resolved
     FROM students s
     LEFT JOIN panels p ON s.panel_id = p.id
     ${where}
     ORDER BY s.created_at DESC
     LIMIT $${l} OFFSET $${o}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM students s ${where}`,
    search ? [`%${search}%`] : []
  );

  return { data: data.rows, total: parseInt(countResult.rows[0].count) };
};

export const getTotalStudents = async () => {
  const r = await query('SELECT COUNT(*) FROM students');
  return parseInt(r.rows[0].count);
};
