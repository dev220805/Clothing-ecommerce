import { Router } from 'express';
import * as ctrl from '../controllers/productController.js';
import * as rev from '../controllers/reviewController.js';
import { optionalAuth, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { reviewRules } from '../validators/commerceValidators.js';

const router = Router();

router.get('/categories', ctrl.getCategories);
router.get('/suggestions', ctrl.searchSuggestions);
router.get('/', ctrl.listProducts);

router.get('/:slug/reviews', rev.listReviews);
router.post('/:slug/reviews', protect, reviewRules, validate, rev.createReview);

router.get('/:slug', optionalAuth, ctrl.getProductBySlug);

router.delete('/reviews/:id', protect, rev.deleteReview);

export default router;
