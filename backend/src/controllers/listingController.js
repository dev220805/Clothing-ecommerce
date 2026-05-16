import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { invalidateProductCache } from './productController.js';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80';

function slugify(name) {
  const s = String(name)
    .toLowerCase()
    .trim()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'listing';
}

async function uniqueSlug(base) {
  let slug = base;
  let n = 0;
  while (await Product.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function parseTags(raw) {
  if (!raw || typeof raw !== 'string') return ['community'];
  const tags = raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
  return tags.length ? tags : ['community'];
}

export const listMine = asyncHandler(async (req, res) => {
  const items = await Product.find({ listedBy: req.user._id })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: items });
});

export const getMine = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, listedBy: req.user._id }).populate(
    'category',
    'name slug'
  );
  if (!product) throw new ApiError(404, 'Listing not found');
  res.json({ success: true, data: product });
});

export const createListing = asyncHandler(async (req, res) => {
  const cat = await Category.findOne({ slug: String(req.body.categorySlug).toLowerCase().trim() });
  if (!cat) throw new ApiError(400, 'Unknown category');

  const baseSlug = await uniqueSlug(slugify(req.body.name));
  const sku = `${baseSlug}-u`.slice(0, 64);

  const imageUrl = req.body.imageUrl?.trim();
  const images = imageUrl
    ? [{ url: imageUrl, alt: req.body.name.trim() }]
    : [{ url: PLACEHOLDER_IMG, alt: req.body.name.trim() }];

  let compareAtPrice;
  if (req.body.compareAtPrice !== undefined && req.body.compareAtPrice !== '' && req.body.compareAtPrice !== null) {
    compareAtPrice = Number(req.body.compareAtPrice);
  }

  const product = await Product.create({
    name: req.body.name.trim(),
    slug: baseSlug,
    description: req.body.description.trim(),
    category: cat._id,
    gender: req.body.gender,
    tags: parseTags(req.body.tags),
    basePrice: Number(req.body.basePrice),
    ...(compareAtPrice !== undefined && !Number.isNaN(compareAtPrice) ? { compareAtPrice } : {}),
    images,
    variants: [
      {
        sku,
        size: req.body.size.trim(),
        color: req.body.color.trim(),
        colorHex: req.body.colorHex?.trim() || '#555555',
        stock: Number(req.body.stock),
        priceModifier: 0,
      },
    ],
    listedBy: req.user._id,
    isActive: true,
    isFeatured: false,
    materials: [],
    ratingAvg: 0,
    ratingCount: 0,
    salesCount: 0,
  });

  await invalidateProductCache();
  res.status(201).json({ success: true, data: product });
});

export const updateListing = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, listedBy: req.user._id });
  if (!product) throw new ApiError(404, 'Listing not found');

  const b = req.body;
  if (b.name !== undefined) product.name = String(b.name).trim();
  if (b.description !== undefined) product.description = String(b.description).trim();
  if (b.basePrice !== undefined) product.basePrice = Number(b.basePrice);
  if (b.gender !== undefined) product.gender = b.gender;
  if (b.isActive !== undefined) product.isActive = Boolean(b.isActive);

  if (b.categorySlug !== undefined && b.categorySlug !== '') {
    const cat = await Category.findOne({ slug: String(b.categorySlug).toLowerCase().trim() });
    if (!cat) throw new ApiError(400, 'Unknown category');
    product.category = cat._id;
  }

  if (b.tags !== undefined) product.tags = parseTags(b.tags);

  if (b.compareAtPrice !== undefined) {
    if (b.compareAtPrice === '' || b.compareAtPrice === null) {
      product.compareAtPrice = undefined;
    } else {
      product.compareAtPrice = Number(b.compareAtPrice);
    }
  }

  if (b.imageUrl !== undefined && b.imageUrl !== '') {
    product.images = [{ url: String(b.imageUrl).trim(), alt: product.name }];
  }

  if (b.size !== undefined || b.color !== undefined || b.stock !== undefined || b.colorHex !== undefined) {
    const v = product.variants[0];
    if (!v) throw new ApiError(400, 'Listing has no variant row');
    if (b.size !== undefined) v.size = String(b.size).trim();
    if (b.color !== undefined) v.color = String(b.color).trim();
    if (b.colorHex !== undefined) v.colorHex = String(b.colorHex).trim() || v.colorHex;
    if (b.stock !== undefined) v.stock = Number(b.stock);
    product.markModified('variants');
  }

  await product.save();
  await invalidateProductCache();
  res.json({ success: true, data: product });
});

export const deleteListing = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, listedBy: req.user._id });
  if (!product) throw new ApiError(404, 'Listing not found');

  const pid = product._id;
  await Promise.all([
    product.deleteOne(),
    Cart.updateMany({}, { $pull: { items: { product: pid } } }),
    Wishlist.updateMany({}, { $pull: { products: pid } }),
    Review.deleteMany({ product: pid }),
  ]);
  await invalidateProductCache();
  res.json({ success: true, message: 'Listing removed' });
});
