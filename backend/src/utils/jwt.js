import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpires });
}

export function signRefreshToken(payload, rememberMe = false) {
  const expiresIn = rememberMe ? env.jwtRefreshRememberExpires : env.jwtRefreshExpires;
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
