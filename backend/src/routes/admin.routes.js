import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import {
  getDashboardStats,
  getPendingBusinesses,
  approveBusiness,
  rejectBusiness
} from '../controllers/admin.controller.js';

const router = Router();

// Todas las rutas de admin requieren autenticación y rol 'admin'
router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/businesses/pending', getPendingBusinesses);
router.patch('/businesses/:id/approve', approveBusiness);
router.patch('/businesses/:id/reject', rejectBusiness);

export default router;
