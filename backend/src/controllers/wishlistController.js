import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function getOrCreate(userId) {
  let w = await Wishlist.findOne({ user: userId });
  if (!w) w = await Wishlist.create({ user: userId, products: [] });
  return w;
}

export const getWishlist = asyncHandler(async (req, res) => {
  const w = await getOrCreate(req.user._id);
  await w.populate({ path: 'products', match: { isActive: true } });
  res.json({ success: true, products: w.products.filter(Boolean) });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  const w = await getOrCreate(req.user._id);
  const idx = w.products.findIndex((p) => p.equals(productId));
  if (idx >= 0) w.products.splice(idx, 1);
  else w.products.push(productId);
  await w.save();
  await w.populate({ path: 'products', select: 'name slug images basePrice ratingAvg' });
  res.json({ success: true, products: w.products });
});
