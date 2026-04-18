import { query } from '../config/db.js';

// ─── Divisions ───────────────────────────────────────────────

export const findOrCreateDivision = async (name) => {
  const existing = await query(
    'SELECT * FROM divisions WHERE LOWER(name) = LOWER($1)',
    [name]
  );
  if (existing.rows.length > 0) return existing.rows[0];
  const result = await query(
    'INSERT INTO divisions (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
};

export const getAllDivisions = async () => {
  const r = await query('SELECT * FROM divisions ORDER BY name');
  return r.rows;
};

// ─── Schools ─────────────────────────────────────────────────

export const findOrCreateSchool = async (name, division_id) => {
  const existing = await query(
    'SELECT * FROM schools WHERE LOWER(name) = LOWER($1) AND division_id = $2',
    [name, division_id]
  );
  if (existing.rows.length > 0) return existing.rows[0];
  const result = await query(
    'INSERT INTO schools (name, division_id) VALUES ($1, $2) RETURNING *',
    [name, division_id]
  );
  return result.rows[0];
};

export const getAllSchools = async () => {
  const r = await query(
    `SELECT s.*, d.name AS division_name
     FROM schools s JOIN divisions d ON s.division_id = d.id
     ORDER BY d.name, s.name`
  );
  return r.rows;
};

// ─── Departments ─────────────────────────────────────────────

export const findOrCreateDepartment = async (name, school_id) => {
  const existing = await query(
    'SELECT * FROM departments WHERE LOWER(name) = LOWER($1) AND school_id = $2',
    [name, school_id]
  );
  if (existing.rows.length > 0) return existing.rows[0];
  const result = await query(
    'INSERT INTO departments (name, school_id) VALUES ($1, $2) RETURNING *',
    [name, school_id]
  );
  return result.rows[0];
};

export const getAllDepartments = async () => {
  const r = await query(
    `SELECT d.*, s.name AS school_name, div.name AS division_name
     FROM departments d
     JOIN schools s     ON d.school_id = s.id
     JOIN divisions div ON s.division_id = div.id
     ORDER BY div.name, s.name, d.name`
  );
  return r.rows;
};

// ─── Panels ──────────────────────────────────────────────────

export const findOrCreatePanel = async (name, department_id) => {
  const existing = await query(
    'SELECT * FROM panels WHERE LOWER(name) = LOWER($1) AND department_id = $2',
    [name, department_id]
  );
  if (existing.rows.length > 0) return existing.rows[0];
  const result = await query(
    'INSERT INTO panels (name, department_id) VALUES ($1, $2) RETURNING *',
    [name, department_id]
  );
  return result.rows[0];
};

export const getAllPanels = async () => {
  const r = await query(
    `SELECT p.*, d.name AS department_name, s.name AS school_name, div.name AS division_name
     FROM panels p
     JOIN departments d ON p.department_id = d.id
     JOIN schools s     ON d.school_id = s.id
     JOIN divisions div ON s.division_id = div.id
     ORDER BY div.name, s.name, d.name, p.name`
  );
  return r.rows;
};

// ─── Full hierarchy tree ─────────────────────────────────────

export const getHierarchyTree = async () => {
  const r = await query(`
    SELECT
      div.id   AS division_id,   div.name AS division_name,
      s.id     AS school_id,     s.name   AS school_name,
      d.id     AS department_id, d.name   AS department_name,
      p.id     AS panel_id,      p.name   AS panel_name
    FROM divisions div
    LEFT JOIN schools     s   ON s.division_id   = div.id
    LEFT JOIN departments d   ON d.school_id     = s.id
    LEFT JOIN panels      p   ON p.department_id = d.id
    ORDER BY div.name, s.name, d.name, p.name
  `);

  const tree = {};
  for (const row of r.rows) {
    if (!tree[row.division_id]) {
      tree[row.division_id] = {
        id: row.division_id, name: row.division_name, schools: {},
      };
    }
    const div = tree[row.division_id];
    if (row.school_id && !div.schools[row.school_id]) {
      div.schools[row.school_id] = {
        id: row.school_id, name: row.school_name, departments: {},
      };
    }
    if (row.school_id && row.department_id && !div.schools[row.school_id].departments[row.department_id]) {
      div.schools[row.school_id].departments[row.department_id] = {
        id: row.department_id, name: row.department_name, panels: [],
      };
    }
    if (row.school_id && row.department_id && row.panel_id) {
      div.schools[row.school_id].departments[row.department_id].panels.push({
        id: row.panel_id, name: row.panel_name,
      });
    }
  }

  return Object.values(tree).map((div) => ({
    ...div,
    schools: Object.values(div.schools).map((sch) => ({
      ...sch,
      departments: Object.values(sch.departments),
    })),
  }));
};
