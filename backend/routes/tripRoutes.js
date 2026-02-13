import { Router } from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
} from '../controllers/tripController.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(getTrips));
router.get('/:id', asyncHandler(getTripById));
router.post('/', asyncHandler(createTrip));
router.put('/:id', asyncHandler(updateTrip));
router.delete('/:id', asyncHandler(deleteTrip));

export default router;
