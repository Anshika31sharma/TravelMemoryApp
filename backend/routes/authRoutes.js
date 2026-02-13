import { Router } from 'express';
import { signup, login, me } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(me));

export default router;
