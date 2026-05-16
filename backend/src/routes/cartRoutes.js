import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as cart from '../controllers/cartController.js';
import { validate } from '../middleware/validate.js';
import { cartAddRules } from '../validators/commerceValidators.js';

const router = Router();
router.use(protect);

router.get('/', cart.getCart);
router.post('/items', cartAddRules, validate, cart.addToCart);
router.patch('/items/:itemId', cart.updateCartItem);
router.delete('/items/:itemId', cart.removeCartItem);
router.delete('/', cart.clearCart);

export default router;
