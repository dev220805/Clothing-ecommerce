import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { isOriginAllowed } from '../lib/corsOrigins.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) logger.error(err);

  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.details && { details: err.details }),
    ...(env.nodeEnv === 'development' && status >= 500 && { stack: err.stack }),
  });
}
