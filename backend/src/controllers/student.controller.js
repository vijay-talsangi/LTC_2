import { findStudentByUserId } from '../models/student.model.js';
import { getAttendanceByStudentId, getAttendanceSummary } from '../models/attendance.model.js';
import { AppError } from '../middleware/error.middleware.js';

export const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await findStudentByUserId(req.user.id);
    if (!student) throw new AppError('Student profile not found', 404);

    const [summary, recentAttendance] = await Promise.all([
      getAttendanceSummary(student.id),
      getAttendanceByStudentId(student.id),
    ]);

    res.json({
      success: true,
      data: {
        student,
        attendanceSummary: summary,
        recentAttendance:  recentAttendance.slice(0, 15),
      },
    });
  } catch (error) { next(error); }
};

export const getStudentAttendance = async (req, res, next) => {
  try {
    const student = await findStudentByUserId(req.user.id);
    if (!student) throw new AppError('Student profile not found', 404);

    const { from, to } = req.query;
    const [records, summary] = await Promise.all([
      getAttendanceByStudentId(student.id, { from, to }),
      getAttendanceSummary(student.id),
    ]);

    res.json({ success: true, data: { records, summary } });
  } catch (error) { next(error); }
};
