import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';
import { User } from '../models/User.js';

const buildSort = (sort) => {
  switch (sort) {
    case 'price_asc':
      return { basePrice: 1 };
    case 'price_desc':
      return { basePrice: -1 };
    case 'rating':
      return { ratingAvg: -1, ratingCount: -1 };
    case 'popularity':
      return { salesCount: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
  const skip = (page - 1) * limit;
  const {
    category,
    gender,
    minPrice,
    maxPrice,
    search,
    tags,
    featured,
    sort = 'newest',
  } = req.query;

  const filter = { isActive: true };
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
  }
  if (gender) filter.gender = gender;
  if (minPrice !== undefined) filter.basePrice = { ...filter.basePrice, $gte: Number(minPrice) };
  if (maxPrice !== undefined) filter.basePrice = { ...filter.basePrice, $lte: Number(maxPrice) };
  if (featured === 'true') filter.isFeatured = true;
  if (tags) filter.tags = { $in: String(tags).split(',') };
  if (search) filter.$text = { $search: search };

  const cacheKey = `products:${JSON.stringify({ ...filter, page, limit, sort })}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    res.setHeader(
      'Cache-Control',
      `public, max-age=0, s-maxage=${featured === 'true' ? 120 : 45}, stale-while-revalidate=${featured === 'true' ? 480 : 240}`
    );
    return res.json(cached);
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(buildSort(sort))
      .skip(skip)
      .limit(limit)
      .select('-description')
      .lean(),
    Product.countDocuments(filter),
  ]);

  const payload = {
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
  const ttl = featured === 'true' ? 300 : 45;
  await cacheSet(cacheKey, payload, ttl);
  res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${featured === 'true' ? 120 : 45}, stale-while-revalidate=${featured === 'true' ? 480 : 240}`);
  res.json(payload);
});

export const searchSuggestions = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ success: true, suggestions: [] });

  const cacheKey = `suggest:${q.toLowerCase()}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=400');
    return res.json(cached);
  }

  const items = await Product.find({
    isActive: true,
    $text: { $search: q },
  })
    .select('name slug images')
    .limit(8)
    .lean();

  const suggestions = items.map((p) => ({
    name: p.name,
    slug: p.slug,
    thumb: p.images?.[0]?.url,
  }));
  const payload = { success: true, suggestions };
  await cacheSet(cacheKey, payload, 180);
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=400');
  res.json(payload);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    'category',
    'name slug'
  );
  if (!product) throw new ApiError(404, 'Product not found');

  if (req.user) {
    await User.updateOne(
      { _id: req.user._id },
      {
        $pull: { recentlyViewed: { product: product._id } },
      }
    );
    await User.updateOne(
      { _id: req.user._id },
      {
        $push: {
          recentlyViewed: {
            $each: [{ product: product._id, viewedAt: new Date() }],
            $position: 0,
            $slice: 20,
          },
        },
      }
    );
  }

  await Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } });

  const related = await Product.find({
    isActive: true,
    _id: { $ne: product._id },
    category: product.category._id || product.category,
  })
    .limit(8)
    .select('name slug basePrice images ratingAvg')
    .lean();

  res.json({ success: true, data: product, related });
});

export const getCategories = asyncHandler(async (req, res) => {
  const cached = await cacheGet('categories:all');
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=1800');
    return res.json(cached);
  }
  const cats = await Category.find().sort({ order: 1, name: 1 }).lean();
  const payload = { success: true, data: cats };
  await cacheSet('categories:all', payload, 900);
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=1800');
  res.json(payload);
});

export const invalidateProductCache = async () => {
  await cacheDel('products:*');
  await cacheDel('categories:*');
  await cacheDel('suggest:*');
};
