import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as o from '../controllers/orderController.js';
import * as c from '../controllers/couponController.js';
import { validate } from '../middleware/validate.js';
import { couponValidateRules } from '../validators/commerceValidators.js';

const router = Router();

router.post('/coupons/validate', protect, couponValidateRules, validate, c.validateCoupon);

router.use(protect);
router.post('/preview', o.previewCheckout);
router.post('/payment-intent', o.createPaymentIntent);
router.post('/place', o.placeOrder);
router.get('/recently-viewed', o.getRecentlyViewed);
router.get('/mine', o.listMyOrders);
router.get('/track/:orderNumber', o.getOrder);

export default router;
