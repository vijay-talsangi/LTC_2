import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize }    from '../middleware/role.middleware.js';
import { validate, attendanceSchema } from '../utils/validator.js';
import {
  getFacultyDashboard,
  getPanelStudents,
  markFacultyAttendance,
  getAttendanceForDate,
  getAttendanceDates,
} from '../controllers/faculty.controller.js';

const router = Router();

router.use(authenticate, authorize('faculty'));

router.get ('/dashboard',         getFacultyDashboard);
router.get ('/students',          getPanelStudents);
router.post('/attendance',        validate(attendanceSchema), markFacultyAttendance);
router.get ('/attendance',        getAttendanceForDate);   // ?date=YYYY-MM-DD
router.get ('/attendance/dates',  getAttendanceDates);

export default router;
