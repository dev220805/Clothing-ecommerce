import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

function findVariant(product, sku) {
  return product.variants.find((v) => v.sku === sku);
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate({
    path: 'items.product',
    select: 'name slug images basePrice variants isActive',
  });
  res.json({ success: true, cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantSku, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  const variant = findVariant(product, variantSku);
  if (!variant) throw new ApiError(400, 'Invalid variant');
  if (variant.stock < quantity) throw new ApiError(400, 'Insufficient stock');

  const cart = await getOrCreateCart(req.user._id);
  const idx = cart.items.findIndex((i) => i.product.equals(productId) && i.variantSku === variantSku && !i.savedForLater);
  if (idx >= 0) cart.items[idx].quantity += quantity;
  else cart.items.push({ product: productId, variantSku, quantity, savedForLater: false });

  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name slug images basePrice variants' });
  res.json({ success: true, cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity, savedForLater } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, 'Item not found');

  const product = await Product.findById(item.product);
  const variant = findVariant(product, item.variantSku);
  if (quantity != null) {
    if (variant.stock < quantity) throw new ApiError(400, 'Insufficient stock');
    item.quantity = quantity;
  }
  if (savedForLater !== undefined) item.savedForLater = savedForLater;

  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name slug images basePrice variants' });
  res.json({ success: true, cart });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items.pull(req.params.itemId);
  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name slug images basePrice variants' });
  res.json({ success: true, cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, cart });
});
