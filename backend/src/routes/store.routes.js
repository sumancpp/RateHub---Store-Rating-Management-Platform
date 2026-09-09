import { Router } from 'express';
import {
  getStores,
  getStoreById,
  submitRating,
  updateRating,
} from '../controllers/store.controller.js';
import {
  authenticateUser,
  optionalAuthenticateUser,
  requireRole,
} from '../middleware/auth.middleware.js';

const router = Router();

// Store listings accessible with optional authentication to return myRating
router.get('/', optionalAuthenticateUser, getStores);
router.get('/:id', optionalAuthenticateUser, getStoreById);

// Ratings submission and modification strictly require USER role
router.post('/:id/ratings', authenticateUser, requireRole('USER'), submitRating);
router.put('/:id/ratings', authenticateUser, requireRole('USER'), updateRating);

export default router;
