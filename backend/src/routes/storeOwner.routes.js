import { Router } from 'express';
import {
  getStoreOwnerDashboard,
  getStoreRatings,
} from '../controllers/storeOwner.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Store owner routes strictly require STORE_OWNER role
router.use(authenticateUser, requireRole('STORE_OWNER'));

router.get('/dashboard', getStoreOwnerDashboard);
router.get('/ratings', getStoreRatings);

export default router;
