/**
 * Vercel build step for the API project (no compilation).
 * Verifies serverless entries resolve before deploy.
 */
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(root, '..');

async function assertExists(relativePath) {
  await access(path.join(rootDir, relativePath));
}

try {
  await assertExists('api/_handler.js');
  await assertExists('api/index.js');
  await assertExists('api/[[...path]].js');
  await assertExists('src/app.js');
  await assertExists('public/index.html');
  await import('../api/_handler.js');
  console.log('[build] API entries verified');
} catch (err) {
  console.error('[build] API verification failed:', err.message);
  process.exit(1);
}
