import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize }    from '../middleware/role.middleware.js';
import { getStudentDashboard, getStudentAttendance } from '../controllers/student.controller.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/dashboard',  getStudentDashboard);
router.get('/attendance', getStudentAttendance); // ?from=YYYY-MM-DD&to=YYYY-MM-DD

export default router;
