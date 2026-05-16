import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as w from '../controllers/wishlistController.js';

const router = Router();
router.use(protect);
router.get('/', w.getWishlist);
router.post('/toggle', w.toggleWishlist);

export default router;
