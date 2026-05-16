import { body, param } from 'express-validator';

const genderValues = ['men', 'women', 'kids', 'unisex'];

export const listingCreateRules = [
  body('categorySlug').trim().notEmpty().withMessage('Category is required'),
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Title must be 2–120 characters'),
  body('description').trim().isLength({ min: 10, max: 8000 }).withMessage('Description must be at least 10 characters'),
  body('basePrice').isFloat({ min: 0, max: 1_000_000 }).withMessage('Valid price required'),
  body('gender').isIn(genderValues).withMessage('Invalid gender'),
  body('size').trim().isLength({ min: 1, max: 40 }).withMessage('Size is required'),
  body('color').trim().isLength({ min: 1, max: 60 }).withMessage('Color is required'),
  body('stock').isInt({ min: 0, max: 999 }).withMessage('Stock must be 0–999'),
  body('imageUrl').optional({ values: 'falsy' }).trim().isURL().withMessage('Image must be a valid URL'),
  body('tags').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('compareAtPrice').optional({ values: 'falsy' }).isFloat({ min: 0, max: 1_000_000 }),
];

export const listingUpdateRules = [
  param('id').isMongoId().withMessage('Invalid listing id'),
  body('categorySlug').optional({ values: 'falsy' }).trim().notEmpty(),
  body('name').optional({ values: 'falsy' }).trim().isLength({ min: 2, max: 120 }),
  body('description').optional({ values: 'falsy' }).trim().isLength({ min: 10, max: 8000 }),
  body('basePrice').optional({ values: 'falsy' }).isFloat({ min: 0, max: 1_000_000 }),
  body('gender').optional({ values: 'falsy' }).isIn(genderValues),
  body('size').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 40 }),
  body('color').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 60 }),
  body('stock').optional({ values: 'falsy' }).isInt({ min: 0, max: 999 }),
  body('imageUrl').optional({ values: 'falsy' }).trim().isURL(),
  body('tags').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('isActive').optional().isBoolean(),
];

export const listingIdParam = [param('id').isMongoId().withMessage('Invalid listing id')];
