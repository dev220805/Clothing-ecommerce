import { env } from '../config/env.js';

/** Allow any https *.vercel.app frontend (preview URLs change each deploy). */
function isVercelFrontend(origin) {
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

export function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  if (env.clientOrigins.includes(normalized)) return true;
  if (env.allowVercelFrontends && isVercelFrontend(normalized)) return true;
  return false;
}

export function corsOrigin(origin, callback) {
  if (isOriginAllowed(origin)) return callback(null, true);
  console.warn('[cors] blocked origin:', origin, '| configured:', env.clientOrigins.join(', '));
  callback(null, false);
}
