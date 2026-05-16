import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String, default: '#000000' },
  stock: { type: Number, required: true, min: 0, default: 0 },
  priceModifier: { type: Number, default: 0 },
  image: String,
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    gender: { type: String, enum: ['men', 'women', 'kids', 'unisex'], default: 'unisex', index: true },
    tags: [{ type: String, lowercase: true, index: true }],
    basePrice: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, min: 0 },
    images: [{ url: String, alt: String, publicId: String }],
    variants: [variantSchema],
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    salesCount: { type: Number, default: 0, min: 0, index: true },
    viewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    /** Set when a signed-in user lists an item for sale; null for catalog/seed/admin products */
    listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    materials: [String],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, basePrice: 1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ isFeatured: 1, salesCount: -1 });
productSchema.index({ gender: 1, category: 1 });

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

export const Product = mongoose.model('Product', productSchema);
