import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { validateEnv } from '../src/config/env.js';

validateEnv();

/** Vercel serverless: allow longer cold starts on Pro; Hobby max is 10s */
export const config = {
  maxDuration: 10,
};

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
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
