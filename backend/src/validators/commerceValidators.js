import { body } from 'express-validator';

export const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().isLength({ min: 4, max: 2000 }),
];

export const cartAddRules = [
  body('productId').isMongoId(),
  body('variantSku').notEmpty(),
  body('quantity').optional().isInt({ min: 1, max: 99 }),
];

export const couponValidateRules = [
  body('code').trim().notEmpty(),
  body('subtotal').isFloat({ min: 0 }),
];
