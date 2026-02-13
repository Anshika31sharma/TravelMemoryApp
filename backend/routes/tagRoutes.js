import { Router } from 'express';
import { getTags } from '../controllers/tagController.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.use(authMiddleware);
router.get('/', asyncHandler(getTags));

export default router;
