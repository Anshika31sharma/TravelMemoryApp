import { Router } from 'express';
import {
  getPhotos,
  uploadPhotos,
  updatePhoto,
  deletePhoto,
} from '../controllers/photoController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', asyncHandler(getPhotos));
router.post('/', upload.array('photos', 10), asyncHandler(uploadPhotos));
router.put('/:photoId', asyncHandler(updatePhoto));
router.delete('/:photoId', asyncHandler(deletePhoto));

export default router;
