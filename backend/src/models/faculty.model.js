import { query } from '../config/db.js';

export const createFaculty = async (data) => {
  const {
    user_id, faculty_id, name, email, dob,
    phone, division, school, department, panel, panel_id, role,
  } = data;
  const result = await query(
    `INSERT INTO faculty
       (user_id, faculty_id, name, email, dob, phone, division, school, department, panel, panel_id, role)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [user_id, faculty_id, name, email, dob, phone, division, school, department, panel, panel_id, role]
  );
  return result.rows[0];
};

export const findFacultyByEmail = async (email) => {
  const r = await query('SELECT * FROM faculty WHERE email = $1', [email]);
  return r.rows[0] || null;
};

export const findFacultyByUserId = async (user_id) => {
  const r = await query(
    `SELECT f.*,
            p.name   AS panel_name,
            d.name   AS department_name,
            s.name   AS school_name,
            div.name AS division_name
     FROM faculty f
     LEFT JOIN panels      p   ON f.panel_id = p.id
     LEFT JOIN departments d   ON p.department_id = d.id
     LEFT JOIN schools     s   ON d.school_id = s.id
     LEFT JOIN divisions   div ON s.division_id = div.id
     WHERE f.user_id = $1`,
    [user_id]
  );
  return r.rows[0] || null;
};

export const getAllFaculty = async ({ page = 1, limit = 50, search = '' } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = '';

  if (search) {
    where = 'WHERE f.name ILIKE $1 OR f.email ILIKE $1 OR f.faculty_id ILIKE $1';
    params.push(`%${search}%`, limit, offset);
  } else {
    params.push(limit, offset);
  }

  const [l, o] = search ? [2, 3] : [1, 2];

  const data = await query(
    `SELECT f.*, p.name AS panel_name_resolved
     FROM faculty f
     LEFT JOIN panels p ON f.panel_id = p.id
     ${where}
     ORDER BY f.created_at DESC
     LIMIT $${l} OFFSET $${o}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM faculty f ${where}`,
    search ? [`%${search}%`] : []
  );

  return { data: data.rows, total: parseInt(countResult.rows[0].count) };
};

export const getStudentsByPanelForFaculty = async (panel_id) => {
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

export const updateFacultyPanel = async (id, panel_id) => {
  const r = await query(
    'UPDATE faculty SET panel_id = $1 WHERE id = $2 RETURNING *',
    [panel_id, id]
  );
  return r.rows[0];
};

export const getTotalFaculty = async () => {
  const r = await query('SELECT COUNT(*) FROM faculty');
  return parseInt(r.rows[0].count);
};
