/** Catch-all: /api, /api/health, /api/auth/... (required on Vercel; api/index.js alone only serves /api) */
export { default, config } from './_handler.js';
