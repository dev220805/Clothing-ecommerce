/**
 * Vercel build step for the API project (no compilation).
 * Verifies the serverless entry and app module resolve before deploy.
 */
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(root, '..');

async function assertExists(relativePath) {
  const full = path.join(rootDir, relativePath);
  await access(full);
}

try {
  await assertExists('api/index.js');
  await assertExists('src/app.js');
  await import('../api/index.js');
  console.log('[build] API entry verified');
} catch (err) {
  console.error('[build] API verification failed:', err.message);
  process.exit(1);
}
