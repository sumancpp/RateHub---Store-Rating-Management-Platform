import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
} from '../controllers/admin.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticateUser, requireRole('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.get('/stores', getStores);
router.post('/stores', createStore);

export default router;
