import mongoose from 'mongoose';
import { env } from './env.js';

/** Reuse connection across Vercel serverless invocations */
const globalCache = globalThis;

if (!globalCache.mongooseCache) {
  globalCache.mongooseCache = { conn: null, promise: null };
}

const cache = globalCache.mongooseCache;

export async function connectDB() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true);
    cache.promise = mongoose.connect(env.mongoUri, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
