import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

export function validateEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(`[env] Missing: ${missing.join(', ')} — set in Vercel → Environment Variables`);
  }
}

/** Frontend origin(s) for CORS — never infer from VERCEL_URL on the API project */
function resolveClientOrigins() {
  const fromList = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const primary = process.env.CLIENT_URL?.trim().replace(/\/$/, '');
  const set = new Set(fromList);
  if (primary) set.add(primary);
  if (!set.size) set.add('http://localhost:5173');
  return [...set];
}

/** Separate Vercel projects: frontend and API are different origins → cookies need SameSite=None */
function resolveCookieSameSite() {
  const explicit = process.env.COOKIE_SAME_SITE;
  if (explicit === 'none' || explicit === 'lax' || explicit === 'strict') return explicit;
  if (process.env.CROSS_ORIGIN_AUTH === 'true') return 'none';
  if (process.env.CROSS_ORIGIN_AUTH === 'false') return 'lax';

  const client = process.env.CLIENT_URL?.trim();
  if (client && process.env.VERCEL_URL) {
    try {
      const clientHost = new URL(client).hostname;
      const apiHost = process.env.VERCEL_URL.replace(/^https?:\/\//, '').split('/')[0];
      if (clientHost !== apiHost) return 'none';
    } catch {
      /* ignore */
    }
  }
  return process.env.NODE_ENV === 'production' ? 'lax' : 'lax';
}

const clientOrigins = resolveClientOrigins();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: clientOrigins[0],
  clientOrigins,
  cookieSameSite: resolveCookieSameSite(),
  isCrossOriginAuth: resolveCookieSameSite() === 'none',
  mongoUri: process.env.MONGODB_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  jwtRefreshRememberExpires: process.env.JWT_REFRESH_REMEMBER_EXPIRES || '30d',
  redisUrl: process.env.REDIS_URL || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  email: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Atlas Commerce <noreply@atlas.local>',
  },
};
