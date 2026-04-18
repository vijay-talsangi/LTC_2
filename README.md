# LTCC Campus Portal
### Role-Based Student-Faculty Management System

> **Stack:** Bun + Express.js · Neon PostgreSQL · React + Vite · JWT Auth · bcrypt · xlsx

---

## 📁 Project Structure

```
LTCC/
├── backend/                  # Bun + Express API
│   ├── schema.sql            # DB schema (run once)
│   ├── index.js              # Entry point
│   ├── .env                  # Environment variables ← FILL THIS IN
│   └── src/
│       ├── config/           # db.js | jwt.js | initDb.js
│       ├── controllers/      # auth | admin | faculty | student
│       ├── middleware/       # auth | role | upload | error
│       ├── models/           # user | faculty | student | hierarchy | attendance
│       ├── routes/           # auth | admin | faculty | student
│       ├── services/         # excel.service.js | email.service.js (stub)
│       └── utils/            # logger | helpers | validator
│
└── frontend/                 # React + Vite
    └── src/
        ├── api/              # auth | admin | faculty | student
        ├── components/       # Layout | Sidebar | ProtectedRoute | StatsCard
        ├── context/          # AuthContext (JWT)
        └── pages/
            ├── admin/        # Dashboard | UploadSheet | ManageHierarchy | FacultyList | StudentList
            ├── faculty/      # FacultyDashboard | AttendanceMark | AttendanceHistory
            └── student/      # StudentDashboard
```

---

## ⚙️ Setup & Run Locally

### Step 1 – Configure Environment

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_super_secret_key
ADMIN_EMAIL=admin@ltcc.edu
ADMIN_PASSWORD=Admin@123
```

> Get your Neon DB connection string from https://neon.tech

---

### Step 2 – Initialize Database

```bash
cd backend
node src/config/initDb.js
# or with Bun:
bun run db:init
```

This will:
- Create all 8 tables (divisions → schools → departments → panels → users → faculty → students → attendance)
- Seed the admin user with credentials from `.env`

---

### Step 3 – Start Backend

```bash
cd backend
# With Bun (recommended):
bun run dev

# Or with Node:
node index.js
```

Backend runs at → **http://localhost:5000**

---

### Step 4 – Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at → **http://localhost:5173**

---

## 🔐 Default Login

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ltcc.edu` | `Admin@123` |
| Faculty | (from Excel) | DOB as `DDMMYYYY` |
| Student | (from Excel) | DOB as `DDMMYYYY` |

**DOB password example:** Born on 1 Jan 2000 → password = `01012000`

---

## 📤 Excel Sheet Format

### Faculty Sheet
| Faculty ID | Faculty Name | Email | DOB | Phone | Division | School | Department | Panel Assigned | Role |
|---|---|---|---|---|---|---|---|---|---|

### Student Sheet
| Name | Email | DOB | Division | School | Department | Panel |
|---|---|---|---|---|---|---|

> **Tip:** Column names are matched case-insensitively and flexible (e.g. "Faculty Name" or "Name" both work).
> DOB can be a date cell, a string like `2000-01-01`, or an Excel serial number.

---

## 🌐 API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | All | Login |
| GET  | `/api/auth/me` | All | Get current user |
| GET  | `/api/admin/stats` | Admin | Dashboard stats |
| POST | `/api/admin/upload/faculty` | Admin | Upload faculty Excel |
| POST | `/api/admin/upload/students` | Admin | Upload student Excel |
| GET  | `/api/admin/faculty` | Admin | List faculty |
| GET  | `/api/admin/students` | Admin | List students |
| GET  | `/api/admin/hierarchy` | Admin | Hierarchy tree |
| POST | `/api/admin/hierarchy` | Admin | Create node |
| GET  | `/api/admin/panels` | Admin | List panels |
| GET  | `/api/faculty/dashboard` | Faculty | Dashboard + stats |
| GET  | `/api/faculty/students` | Faculty | Panel students |
| POST | `/api/faculty/attendance` | Faculty | Mark attendance |
| GET  | `/api/faculty/attendance?date=YYYY-MM-DD` | Faculty | Get attendance for date |
| GET  | `/api/faculty/attendance/dates` | Faculty | Past session dates |
| GET  | `/api/student/dashboard` | Student | Dashboard |
| GET  | `/api/student/attendance` | Student | Attendance history |

---

## 📧 Email System (AWS SES)

Email is currently **stubbed** — it logs to console but does not send.

To enable SES, add credentials to `.env`:

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
SES_FROM_EMAIL=noreply@yourdomain.com
```

Then replace `email.service.js` stub with the actual `@aws-sdk/client-ses` implementation.

---

## 🔧 Useful Commands

```bash
# Backend dev (with hot reload)
cd backend && bun run dev

# Frontend dev
cd frontend && npm run dev

# Re-init DB (reset schema)
cd backend && bun run db:init

# Health check
curl http://localhost:5000/api/health
```
