import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

export function configureCloudinary() {
  if (env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
    });
    return true;
  }
  return false;
}

export { cloudinary };
