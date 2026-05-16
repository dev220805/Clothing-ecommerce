import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Coupon } from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';
import { invalidateProductCache } from './productController.js';

const dayMs = 86400000;

export const dashboard = asyncHandler(async (req, res) => {
  const cacheKey = 'admin:dashboard:v1';
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const since = new Date(Date.now() - 30 * dayMs);
  const [revenueAgg, ordersCount, usersCount, topProducts, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $nin: ['cancelled', 'refunded'] } } },
      { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments(),
    User.countDocuments(),
    Product.find({ isActive: true }).sort({ salesCount: -1 }).limit(6).select('name slug salesCount basePrice images').lean(),
    Order.find().sort({ createdAt: -1 }).limit(8).populate('user', 'name email').lean(),
  ]);

  const revenue = revenueAgg[0]?.revenue || 0;
  const ordersInPeriod = revenueAgg[0]?.count || 0;

  const salesByDay = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $nin: ['cancelled', 'refunded'] } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const payload = {
    success: true,
    stats: {
      revenue30d: Math.round(revenue * 100) / 100,
      orders30d: ordersInPeriod,
      totalOrders: ordersCount,
      totalUsers: usersCount,
    },
    topProducts,
    recentOrders,
    salesByDay,
  };
  await cacheSet(cacheKey, payload, 60);
  res.json(payload);
});

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;
  const q = req.query.search ? new RegExp(req.query.search, 'i') : null;
  const filter = q ? { $or: [{ name: q }, { email: q }] } : {};
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password -refreshTokens').lean(),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const setUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.role = req.body.role === 'admin' ? 'admin' : 'user';
  await user.save();
  res.json({ success: true, user });
});

export const listAdminOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email').lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) throw new ApiError(404, 'Order not found');
  const { status, trackingNumber, carrier, note } = req.body;
  if (status) {
    order.status = status;
    order.statusHistory.push({ status, note });
  }
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (carrier !== undefined) order.carrier = carrier;
  await order.save();
  await cacheDel('admin:*');
  res.json({ success: true, order });
});

export const createProduct = asyncHandler(async (req, res) => {
  const data = req.body;
  const product = await Product.create(data);
  await invalidateProductCache();
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  Object.assign(product, req.body);
  await product.save();
  await invalidateProductCache();
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Not found');
  product.isActive = false;
  await product.save();
  await invalidateProductCache();
  res.json({ success: true });
});

export const listAdminProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 24);
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Product.find().sort({ updatedAt: -1 }).skip(skip).limit(limit).populate('category', 'name slug').lean(),
    Product.countDocuments(),
  ]);
  res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const upsertCoupon = asyncHandler(async (req, res) => {
  const { code, ...rest } = req.body;
  const c = await Coupon.findOneAndUpdate(
    { code: String(code).toUpperCase() },
    { ...rest, code: String(code).toUpperCase() },
    { upsert: true, new: true }
  );
  res.json({ success: true, coupon: c });
});

export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: coupons });
});

export const createCategory = asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  await invalidateProductCache();
  res.status(201).json({ success: true, data: cat });
});
