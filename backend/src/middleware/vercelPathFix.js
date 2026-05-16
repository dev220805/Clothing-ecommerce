const API_PREFIXES = [
  '/auth',
  '/products',
  '/cart',
  '/wishlist',
  '/orders',
  '/admin',
  '/uploads',
  '/listings',
];

/** Vercel serverless may invoke Express with paths missing the /api prefix. */
export function vercelPathFix(req, res, next) {
  if (!process.env.VERCEL) return next();

  const raw = req.url || '/';
  const q = raw.indexOf('?');
  const pathOnly = q >= 0 ? raw.slice(0, q) : raw;
  const query = q >= 0 ? raw.slice(q) : '';

  if (pathOnly.startsWith('/api')) return next();

  const needsApi = API_PREFIXES.some((p) => pathOnly === p || pathOnly.startsWith(`${p}/`));
  if (needsApi) {
    req.url = `/api${pathOnly}${query}`;
  }
  next();
}
