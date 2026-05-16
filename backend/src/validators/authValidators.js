import { body, param, query } from 'express-validator';

export const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const forgotRules = [body('email').isEmail().normalizeEmail()];

export const resetRules = [
  body('email').isEmail().normalizeEmail(),
  body('token').notEmpty(),
  body('password').isLength({ min: 8, max: 128 }),
];

export const verifyEmailRules = [body('email').isEmail().normalizeEmail(), body('token').notEmpty()];

export const addressRules = [
  body('line1').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('postalCode').trim().notEmpty(),
];
