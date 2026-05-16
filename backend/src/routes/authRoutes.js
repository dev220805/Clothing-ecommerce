import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerRules,
  loginRules,
  forgotRules,
  resetRules,
  verifyEmailRules,
  addressRules,
} from '../validators/authValidators.js';

const router = Router();

router.post('/register', authLimiter, registerRules, validate, auth.register);
router.post('/login', authLimiter, loginRules, validate, auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', protect, auth.logout);
router.post('/logout-all', protect, auth.logoutAll);
router.post('/forgot-password', authLimiter, forgotRules, validate, auth.forgotPassword);
router.post('/reset-password', authLimiter, resetRules, validate, auth.resetPassword);
router.post('/verify-email', verifyEmailRules, validate, auth.verifyEmail);

router.get('/me', protect, auth.getMe);
router.patch('/me', protect, auth.updateProfile);
router.post('/me/addresses', protect, addressRules, validate, auth.addAddress);
router.patch('/me/addresses/:id', protect, auth.updateAddress);
router.delete('/me/addresses/:id', protect, auth.deleteAddress);

export default router;
