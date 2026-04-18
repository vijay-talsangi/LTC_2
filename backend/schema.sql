-- ============================================================
-- LTCC Role-Based Student-Faculty Management System
-- Database Schema for Neon PostgreSQL
-- ============================================================

-- Hierarchy Tables
CREATE TABLE IF NOT EXISTS divisions (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schools (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  division_id INTEGER REFERENCES divisions(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, division_id)
);

CREATE TABLE IF NOT EXISTS departments (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  school_id  INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, school_id)
);

CREATE TABLE IF NOT EXISTS panels (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  created_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, department_id)
);

-- Auth Table
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  faculty_id VARCHAR(100) UNIQUE,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  dob        DATE,
  phone      VARCHAR(20),
  division   VARCHAR(255),
  school     VARCHAR(255),
  department VARCHAR(255),
  panel      VARCHAR(255),
  panel_id   INTEGER REFERENCES panels(id),
  role       VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  dob        DATE,
  division   VARCHAR(255),
  school     VARCHAR(255),
  department VARCHAR(255),
  panel      VARCHAR(255),
  panel_id   INTEGER REFERENCES panels(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id         SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL,
  date       DATE NOT NULL,
  status     VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
CREATE INDEX IF NOT EXISTS idx_faculty_email      ON faculty(email);
CREATE INDEX IF NOT EXISTS idx_faculty_panel_id   ON faculty(panel_id);
CREATE INDEX IF NOT EXISTS idx_faculty_user_id    ON faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_students_email     ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_panel_id  ON students(panel_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id   ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date    ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_faculty ON attendance(faculty_id);
