import app from './app.js';
import { connectDB } from './config/db.js';
import { validateEnv, env } from './config/env.js';
import { logger } from './utils/logger.js';

validateEnv();

/** Local development only — production uses Vercel serverless (`api/index.js`) */
async function start() {
  try {
    await connectDB();
    app.listen(env.port, () => {
      logger.info(`API listening on port ${env.port}`);
    });
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  start();
}

export default app;
