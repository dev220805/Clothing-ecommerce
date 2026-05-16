import app from '../src/app.js';

/** Single serverless entry — all /api/* traffic is rewritten here (see vercel.json). */
export const config = {
  maxDuration: 10,
};

export default app;
