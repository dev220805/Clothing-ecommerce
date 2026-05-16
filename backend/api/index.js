import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { validateEnv } from '../src/config/env.js';

validateEnv();

let dbReady = false;

export default async function handler(req, res) {
  try {
    if (!dbReady) {
      await connectDB();
      dbReady = true;
    }
    return app(req, res);
  } catch (err) {
    console.error('[api]', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}
