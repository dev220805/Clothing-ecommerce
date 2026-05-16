import Stripe from 'stripe';
import crypto from 'crypto';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Coupon } from '../models/Coupon.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import { cacheDel } from '../config/redis.js';
import { invalidateProductCache } from './productController.js';

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

const TAX_RATE = 0.08;
const FREE_SHIP_THRESHOLD = 100;
const SHIPPING_FLAT = 8.99;

function lineTotal(product, variant) {
  return product.basePrice + (variant.priceModifier || 0);
}

export const previewCheckout = asyncHandler(async (req, res) => {
  const { addressId, couponCode } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) throw new ApiError(400, 'Cart empty');

  const items = cart.items.filter((i) => !i.savedForLater);
  if (!items.length) throw new ApiError(400, 'Cart empty');

  let subtotal = 0;
  const lines = [];
  for (const line of items) {
    const p = line.product;
    if (!p?.isActive) continue;
    const v = p.variants.find((x) => x.sku === line.variantSku);
    if (!v || v.stock < line.quantity) throw new ApiError(400, `Unavailable: ${p.name}`);
    const unit = lineTotal(p, v);
    subtotal += unit * line.quantity;
    lines.push({ product: p, variant: v, quantity: line.quantity, unit });
  }

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), isActive: true });
    if (coupon) {
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, 'Coupon expired');
      if (subtotal < (coupon.minOrderValue || 0)) throw new ApiError(400, 'Order too small for coupon');
      if (coupon.discountType === 'percent') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else discount = coupon.discountValue;
      discount = Math.min(discount, subtotal);
    }
  }

  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FLAT;
  const taxable = Math.max(0, subtotal - discount + shipping);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  let shippingAddress = req.body.shippingAddress;
  if (addressId) {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(addressId);
    if (!addr) throw new ApiError(404, 'Address not found');
    shippingAddress = addr.toObject();
  }

  res.json({
    success: true,
    summary: {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      shipping,
      tax,
      total,
      freeShippingProgress: Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100)),
    },
    lines: lines.map((l) => ({
      productId: l.product._id,
      name: l.product.name,
      sku: l.variant.sku,
      quantity: l.quantity,
      unitPrice: l.unit,
    })),
    shippingAddress,
  });
});

export const createPaymentIntent = asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.json({
      success: true,
      mock: true,
      clientSecret: null,
      message: 'Stripe not configured — use demo checkout',
    });
  }
  const { amount } = req.body;
  if (!amount || amount < 50) throw new ApiError(400, 'Invalid amount');
  const pi = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { userId: req.user._id.toString() },
  });
  res.json({ success: true, clientSecret: pi.client_secret, paymentIntentId: pi.id });
});

export const placeOrder = asyncHandler(async (req, res) => {
  const {
    addressId,
    couponCode,
    paymentIntentId,
    paymentProvider = 'stripe',
    useDemoCheckout,
  } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) throw new ApiError(400, 'Cart empty');
  const rawItems = cart.items.filter((i) => !i.savedForLater);
  if (!rawItems.length) throw new ApiError(400, 'Cart empty');

  const user = await User.findById(req.user._id);
  let shippingAddress = req.body.shippingAddress;
  if (addressId) {
    const addr = user.addresses.id(addressId);
    if (!addr) throw new ApiError(404, 'Address not found');
    shippingAddress = addr.toObject();
  }
  if (!shippingAddress) throw new ApiError(400, 'Shipping address required');

  let subtotal = 0;
  const orderItems = [];
  for (const line of rawItems) {
    const p = line.product;
    const v = p.variants.find((x) => x.sku === line.variantSku);
    if (!p.isActive || !v || v.stock < line.quantity) throw new ApiError(400, `Unavailable: ${p.name}`);
    const unit = lineTotal(p, v);
    subtotal += unit * line.quantity;
    orderItems.push({
      product: p._id,
      name: p.name,
      image: p.images?.[0]?.url,
      variantSku: v.sku,
      size: v.size,
      color: v.color,
      quantity: line.quantity,
      unitPrice: unit,
    });
  }

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), isActive: true });
    if (!coupon) throw new ApiError(400, 'Invalid coupon');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, 'Coupon expired');
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(400, 'Coupon exhausted');
    }
    if (subtotal < (coupon.minOrderValue || 0)) throw new ApiError(400, 'Order too small for coupon');
    if (coupon.discountType === 'percent') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else discount = coupon.discountValue;
    discount = Math.min(discount, subtotal);
  }

  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FLAT;
  const taxable = Math.max(0, subtotal - discount + shipping);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  let paymentStatus = 'pending';
  if (paymentProvider === 'stripe' && stripe && !useDemoCheckout) {
    if (!paymentIntentId) throw new ApiError(400, 'Payment intent required');
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.metadata?.userId !== req.user._id.toString()) throw new ApiError(403, 'Invalid payment');
    if (pi.status !== 'succeeded') throw new ApiError(400, 'Payment not completed');
    paymentStatus = 'succeeded';
  } else {
    paymentStatus = 'succeeded';
  }

  const orderNumber = `AT-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const order = await Order.create({
    user: req.user._id,
    orderNumber,
    items: orderItems,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    couponCode: coupon?.code,
    shippingAddress,
    paymentProvider: stripe && paymentIntentId ? 'stripe' : 'cod',
    paymentIntentId: paymentIntentId || undefined,
    paymentStatus,
    status: paymentStatus === 'succeeded' ? 'paid' : 'pending',
    statusHistory: [{ status: paymentStatus === 'succeeded' ? 'paid' : 'pending', note: 'Order placed' }],
  });

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  for (const line of rawItems) {
    const p = line.product;
    const v = p.variants.find((x) => x.sku === line.variantSku);
    v.stock -= line.quantity;
    p.salesCount += line.quantity;
    await p.save();
  }

  cart.items = cart.items.filter((i) => i.savedForLater);
  await cart.save();

  await invalidateProductCache();
  await cacheDel('admin:*');

  res.status(201).json({ success: true, order });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(40, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden');
  }
  res.json({ success: true, order });
});

export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'recentlyViewed.product',
    match: { isActive: true },
  });
  const products = (user.recentlyViewed || [])
    .map((r) => r.product)
    .filter(Boolean)
    .slice(0, 12);
  res.json({ success: true, products });
});
