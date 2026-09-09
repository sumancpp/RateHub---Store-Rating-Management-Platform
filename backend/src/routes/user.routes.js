import { Router } from 'express';
import { changePassword } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

// Change own password requires authentication
router.put('/password', authenticateUser, changePassword);

export default router;
