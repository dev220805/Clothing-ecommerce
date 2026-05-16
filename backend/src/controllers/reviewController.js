import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function recomputeRating(productId) {
  const agg = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg || 0;
  const count = agg[0]?.count || 0;
  await Product.updateOne({ _id: productId }, { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count });
}

export const listReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new ApiError(404, 'Product not found');

  const [reviews, total] = await Promise.all([
    Review.find({ product: product._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ product: product._id }),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new ApiError(404, 'Product not found');

  const purchased = await Order.exists({
    user: req.user._id,
    'items.product': product._id,
    status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
  });

  const existing = await Review.findOne({ product: product._id, user: req.user._id });
  if (existing) throw new ApiError(409, 'You already reviewed this product');

  const review = await Review.create({
    user: req.user._id,
    product: product._id,
    rating: req.body.rating,
    title: req.body.title,
    comment: req.body.comment,
    isVerifiedPurchase: !!purchased,
  });

  await recomputeRating(product._id);
  res.status(201).json({ success: true, data: review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not allowed');
  }
  const pid = review.product;
  await review.deleteOne();
  await recomputeRating(pid);
  res.json({ success: true });
});
