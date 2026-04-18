import { findFacultyByUserId } from '../models/faculty.model.js';
import { getStudentsByPanel } from '../models/student.model.js';
import {
  markAttendance,
  getAttendanceByFacultyAndDate,
  getFacultyAttendanceDates,
} from '../models/attendance.model.js';
import { AppError } from '../middleware/error.middleware.js';

export const getFacultyDashboard = async (req, res, next) => {
  try {
    const faculty = await findFacultyByUserId(req.user.id);
    if (!faculty) throw new AppError('Faculty profile not found', 404);

    const students    = faculty.panel_id ? await getStudentsByPanel(faculty.panel_id) : [];
    const recentDates = faculty.id       ? await getFacultyAttendanceDates(faculty.id) : [];

    res.json({
      success: true,
      data: {
        faculty,
        studentCount:          students.length,
        recentAttendanceDates: recentDates,
      },
    });
  } catch (error) { next(error); }
};

export const getPanelStudents = async (req, res, next) => {
  try {
    const faculty = await findFacultyByUserId(req.user.id);
    if (!faculty)           throw new AppError('Faculty profile not found', 404);
    if (!faculty.panel_id)  throw new AppError('No panel assigned to this faculty', 404);

    const students = await getStudentsByPanel(faculty.panel_id);
    res.json({ success: true, data: { panel_id: faculty.panel_id, panel_name: faculty.panel_name, students } });
  } catch (error) { next(error); }
};

export const markFacultyAttendance = async (req, res, next) => {
  try {
    const faculty = await findFacultyByUserId(req.user.id);
    if (!faculty)          throw new AppError('Faculty profile not found', 404);
    if (!faculty.panel_id) throw new AppError('No panel assigned', 400);

    const { date, records } = req.body;

    const attendanceRecords = records.map((r) => ({
      student_id: r.student_id,
      faculty_id: faculty.id,
      date,
      status:     r.status,
    }));

    const result = await markAttendance(attendanceRecords);

    res.json({
      success: true,
      message: `Attendance saved for ${result.length} student(s) on ${date}`,
      data:    result,
    });
  } catch (error) { next(error); }
};

export const getAttendanceForDate = async (req, res, next) => {
  try {
    const faculty = await findFacultyByUserId(req.user.id);
    if (!faculty)          throw new AppError('Faculty profile not found', 404);
    if (!faculty.panel_id) throw new AppError('No panel assigned', 404);

    const { date } = req.query;
    if (!date) throw new AppError('Query param ?date=YYYY-MM-DD is required', 400);

    const records = await getAttendanceByFacultyAndDate(faculty.id, date, faculty.panel_id);
    res.json({ success: true, data: { date, records } });
  } catch (error) { next(error); }
};

export const getAttendanceDates = async (req, res, next) => {
  try {
    const faculty = await findFacultyByUserId(req.user.id);
    if (!faculty) throw new AppError('Faculty profile not found', 404);

    const dates = await getFacultyAttendanceDates(faculty.id);
    res.json({ success: true, data: dates });
  } catch (error) { next(error); }
};
