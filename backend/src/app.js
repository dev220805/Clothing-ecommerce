import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { vercelPathFix } from './middleware/vercelPathFix.js';
import { corsOrigin } from './lib/corsOrigins.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import listingRoutes from './routes/listingRoutes.js';

const app = express();

app.set('trust proxy', 1);

app.use(vercelPathFix);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}
app.use(apiLimiter);

app.get('/', (req, res) => {
  res.redirect(302, '/api/health');
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'atlas-commerce-api',
    env: env.nodeEnv,
    crossOriginAuth: env.isCrossOriginAuth,
    corsOrigins: env.clientOrigins,
    allowVercelFrontends: env.allowVercelFrontends,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/listings', listingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
