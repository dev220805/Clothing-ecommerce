import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { validateEnv } from '../src/config/env.js';

validateEnv();

export const config = {
  maxDuration: 10,
};

export default async function handler(req, res) {
  try {
    await connectDB();
    if (process.env.VERCEL && req.url && !req.url.split('?')[0].startsWith('/api')) {
      const pathOnly = req.url.split('?')[0];
      if (/^\/(auth|products|cart|wishlist|orders|admin|uploads|listings)(\/|$)/.test(pathOnly)) {
        req.url = `/api${req.url}`;
      }
    }
    app(req, res);
  } catch (err) {
    console.error('[vercel-api]', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
      });
    }
  }
}
