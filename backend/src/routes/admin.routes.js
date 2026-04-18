import { Router } from 'express';
import { authenticate }  from '../middleware/auth.middleware.js';
import { authorize }     from '../middleware/role.middleware.js';
import { uploadExcel }   from '../middleware/upload.middleware.js';
import { validate, hierarchySchema } from '../utils/validator.js';
import {
  getDashboardStats,
  uploadFacultySheet,
  uploadStudentSheet,
  getFacultyList,
  getStudentList,
  getHierarchy,
  getPanels,
  createHierarchyNode,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, authorize('admin'));

router.get ('/stats',            getDashboardStats);
router.get ('/faculty',          getFacultyList);
router.get ('/students',         getStudentList);
router.get ('/hierarchy',        getHierarchy);
router.get ('/panels',           getPanels);
router.post('/hierarchy',        validate(hierarchySchema), createHierarchyNode);
router.post('/upload/faculty',   uploadExcel.single('file'), uploadFacultySheet);
router.post('/upload/students',  uploadExcel.single('file'), uploadStudentSheet);

export default router;
