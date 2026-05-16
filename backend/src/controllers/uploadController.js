import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler.js';
import { configureCloudinary, cloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

export const uploadImages = [
  upload.array('images', 5),
  asyncHandler(async (req, res) => {
    if (!configureCloudinary()) {
      throw new ApiError(503, 'Cloudinary is not configured');
    }
    const urls = [];
    for (const file of req.files || []) {
      const b64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(b64, {
        folder: 'atlas-commerce',
        resource_type: 'image',
      });
      urls.push({ url: result.secure_url, publicId: result.public_id, alt: file.originalname });
    }
    res.json({ success: true, images: urls });
  }),
];
