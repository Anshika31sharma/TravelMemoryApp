import { Router } from 'express';
import {
  getTripDays,
  createTripDay,
  updateTripDay,
  deleteTripDay,
} from '../controllers/tripDayController.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', asyncHandler(getTripDays));
router.post('/', asyncHandler(createTripDay));
router.put('/:dayId', asyncHandler(updateTripDay));
router.delete('/:dayId', asyncHandler(deleteTripDay));

export default router;
