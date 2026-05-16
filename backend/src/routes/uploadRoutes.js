import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { uploadImages } from '../controllers/uploadController.js';

const router = Router();
router.use(protect, adminOnly);
router.post('/images', ...uploadImages);

export default router;
