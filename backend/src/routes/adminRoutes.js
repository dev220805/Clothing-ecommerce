import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminOnly.js';
import * as a from '../controllers/adminController.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/dashboard', a.dashboard);
router.get('/users', a.listUsers);
router.patch('/users/:id/role', a.setUserRole);
router.get('/orders', a.listAdminOrders);
router.patch('/orders/:orderNumber', a.updateOrderStatus);
router.get('/products', a.listAdminProducts);
router.post('/products', a.createProduct);
router.patch('/products/:id', a.updateProduct);
router.delete('/products/:id', a.deleteProduct);
router.get('/coupons', a.listCoupons);
router.post('/coupons', a.upsertCoupon);
router.post('/categories', a.createCategory);

export default router;
