import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { User } from '../models/User.js';

dotenv.config();

/** Seed writes catalog + demo users into MongoDB — the storefront reads only from the database. */

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const categories = [
  { name: 'Men', slug: 'men', description: 'Contemporary menswear', image: IMG('photo-1617137968427-85924c800a22') },
  { name: 'Women', slug: 'women', description: 'Elevated womenswear', image: IMG('photo-1483985988355-763728e1935b') },
  { name: 'Kids', slug: 'kids', description: 'Play-ready essentials', image: IMG('photo-1503454537195-1dcabb73ffb9') },
  { name: 'Sneakers', slug: 'sneakers', description: 'Performance & lifestyle', image: IMG('photo-1542291026-7eec264c27ff') },
  { name: 'Hoodies', slug: 'hoodies', description: 'Layering staples', image: IMG('photo-1556821840-3a63f95609a7') },
  { name: 'Jackets', slug: 'jackets', description: 'Outer layers', image: IMG('photo-1551028719-00167b16eac5') },
];

function variants(baseSku, sizes, colors) {
  const out = [];
  for (const size of sizes) {
    for (const c of colors) {
      out.push({
        sku: `${baseSku}-${size}-${c.code}`,
        size,
        color: c.name,
        colorHex: c.hex,
        stock: 18 + Math.floor(Math.random() * 30),
        priceModifier: c.mod || 0,
      });
    }
  }
  return out;
}

const COL = {
  blk: { name: 'Black', hex: '#111111', mod: 0 },
  wht: { name: 'White', hex: '#f5f5f5', mod: 0 },
  navy: { name: 'Navy', hex: '#1e3a5f', mod: 2 },
  sage: { name: 'Sage', hex: '#9caf88', mod: 4 },
  rust: { name: 'Rust', hex: '#b45309', mod: 3 },
};

function productRow(p) {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.catSlug,
    gender: p.gender,
    tags: p.tags,
    basePrice: p.price,
    compareAtPrice: p.compare,
    images: p.imgs.map((u, i) => ({ url: u, alt: `${p.name} ${i + 1}` })),
    variants: variants(p.sku, p.sizes, p.colors),
    ratingAvg: p.rating,
    ratingCount: p.rc,
    salesCount: p.sales,
    isFeatured: p.featured,
    materials: p.materials || ['Premium blend'],
  };
}

const catalog = [
  {
    name: 'Vertex Pro Running Sneaker',
    slug: 'vertex-pro-running-sneaker',
    description:
      'Responsive foam midsole, engineered mesh upper, and road-ready traction. Built for daily miles and city commutes.',
    catSlug: 'sneakers',
    gender: 'unisex',
    tags: ['running', 'performance', 'new'],
    price: 148,
    compare: 180,
    imgs: [IMG('photo-1542291026-7eec264c27ff'), IMG('photo-1606107557195-0e29a4b5b4aa')],
    sku: 'VRP',
    sizes: ['7', '8', '9', '10', '11'],
    colors: [COL.blk, COL.wht, COL.navy],
    rating: 4.7,
    rc: 842,
    sales: 2100,
    featured: true,
  },
  {
    name: 'Apex Street High-Top',
    slug: 'apex-street-high-top',
    description: 'Padded collar, vulcanized sole, and premium leather overlays for a bold street silhouette.',
    catSlug: 'sneakers',
    gender: 'men',
    tags: ['street', 'leather'],
    price: 129,
    compare: 159,
    imgs: [IMG('photo-1608231383742-f5770f1f36b0'), IMG('photo-1595950653106-6c9ebd614d3a')],
    sku: 'ASH',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: [COL.blk, COL.rust],
    rating: 4.5,
    rc: 412,
    sales: 980,
    featured: true,
  },
  {
    name: 'Lumen Knit Runner',
    slug: 'lumen-knit-runner',
    description: 'Featherweight knit upper with breathable zones and a cushioned heel strike.',
    catSlug: 'sneakers',
    gender: 'women',
    tags: ['knit', 'lightweight'],
    price: 118,
    imgs: [IMG('photo-1595341888016-a39247111d59'), IMG('photo-1460353581641-37baddab0fa2')],
    sku: 'LKR',
    sizes: ['6', '7', '8', '9', '10'],
    colors: [COL.wht, COL.sage, COL.blk],
    rating: 4.6,
    rc: 620,
    sales: 1500,
    featured: false,
  },
  {
    name: 'Monolith Oversized Hoodie',
    slug: 'monolith-oversized-hoodie',
    description: 'Heavyweight French terry, dropped shoulders, and a structured hood. Minimal branding.',
    catSlug: 'hoodies',
    gender: 'unisex',
    tags: ['fleece', 'oversized'],
    price: 89,
    compare: 110,
    imgs: [IMG('photo-1556821840-3a63f95609a7'), IMG('photo-1578587018452-892b21fd88d8')],
    sku: 'MOH',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [COL.blk, COL.navy, COL.sage],
    rating: 4.8,
    rc: 1204,
    sales: 3400,
    featured: true,
  },
  {
    name: 'Signal Zip Tech Hoodie',
    slug: 'signal-zip-tech-hoodie',
    description: 'Four-way stretch panels, zippered pockets, and moisture-wicking interior.',
    catSlug: 'hoodies',
    gender: 'men',
    tags: ['tech', 'zip'],
    price: 96,
    imgs: [IMG('photo-1620799140408-ed53409cd232'), IMG('photo-1509942779193-8f45c445cbd4')],
    sku: 'SZH',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [COL.blk, COL.wht],
    rating: 4.4,
    rc: 310,
    sales: 720,
    featured: false,
  },
  {
    name: 'Aura Cropped Hoodie',
    slug: 'aura-cropped-hoodie',
    description: 'Soft brushed interior, cropped hem, and ribbed cuffs for a clean athletic look.',
    catSlug: 'hoodies',
    gender: 'women',
    tags: ['cropped', 'lounge'],
    price: 72,
    imgs: [IMG('photo-1515886657613-9f3515b0c78f'), IMG('photo-1434389677669-e08b4cac3105')],
    sku: 'ACH',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [COL.wht, COL.sage, COL.rust],
    rating: 4.6,
    rc: 540,
    sales: 1100,
    featured: false,
  },
  {
    name: 'Stratus Shell Jacket',
    slug: 'stratus-shell-jacket',
    description: 'Water-repellent shell, taped seams, and packable hood for unpredictable weather.',
    catSlug: 'jackets',
    gender: 'unisex',
    tags: ['rain', 'shell'],
    price: 198,
    compare: 240,
    imgs: [IMG('photo-1551028719-00167b16eac5'), IMG('photo-1544022613-e87ca75a784a')],
    sku: 'SSJ',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [COL.blk, COL.navy],
    rating: 4.7,
    rc: 280,
    sales: 640,
    featured: true,
  },
  {
    name: 'Forge Puffer Jacket',
    slug: 'forge-puffer-jacket',
    description: 'Responsible down alternative fill, matte shell, and ergonomic quilting.',
    catSlug: 'jackets',
    gender: 'men',
    tags: ['winter', 'puffer'],
    price: 225,
    imgs: [IMG('photo-1591047139829-d91aecb6caea'), IMG('photo-1539533018447-63fcce2678e3')],
    sku: 'FPJ',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [COL.blk, COL.navy],
    rating: 4.5,
    rc: 190,
    sales: 520,
    featured: false,
  },
  {
    name: 'Eclipse Wool Coat',
    slug: 'eclipse-wool-coat',
    description: 'Double-faced wool blend, notch lapel, and hidden placket for refined layering.',
    catSlug: 'jackets',
    gender: 'women',
    tags: ['wool', 'tailored'],
    price: 268,
    compare: 320,
    imgs: [IMG('photo-1539533018447-63fcce2678e3'), IMG('photo-1490481651871-ab68de25d43d')],
    sku: 'EWC',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [COL.blk, COL.rust],
    rating: 4.9,
    rc: 156,
    sales: 410,
    featured: true,
  },
  {
    name: 'Helix Tailored Shirt',
    slug: 'helix-tailored-shirt',
    description: 'Breathable poplin, mother-of-pearl buttons, and a modern slim taper.',
    catSlug: 'men',
    gender: 'men',
    tags: ['office', 'shirt'],
    price: 78,
    imgs: [IMG('photo-1602810318383-e386cc2a3ccf'), IMG('photo-1596755094514-87a05d394b98')],
    sku: 'HTS',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [COL.wht, COL.navy, COL.sage],
    rating: 4.3,
    rc: 220,
    sales: 560,
    featured: false,
  },
  {
    name: 'Cipher Relaxed Tee',
    slug: 'cipher-relaxed-tee',
    description: 'Supima cotton jersey with garment dye and a relaxed block fit.',
    catSlug: 'men',
    gender: 'men',
    tags: ['tee', 'basics'],
    price: 38,
    imgs: [IMG('photo-1521572163474-6864f9cf17ab'), IMG('photo-1576566588028-4147f384df91')],
    sku: 'CRT',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [COL.blk, COL.wht, COL.rust],
    rating: 4.6,
    rc: 890,
    sales: 2400,
    featured: false,
  },
  {
    name: 'Linea Pleated Trousers',
    slug: 'linea-pleated-trousers',
    description: 'Tapered leg, front pleats, and stretch waistband for all-day comfort.',
    catSlug: 'men',
    gender: 'men',
    tags: ['trousers', 'tailored'],
    price: 112,
    imgs: [IMG('photo-1624378515195-6bbdb73dff1a'), IMG('photo-1473966968600-fa801bb869a8')],
    sku: 'LPT',
    sizes: ['28', '30', '32', '34', '36'],
    colors: [COL.blk, COL.navy],
    rating: 4.4,
    rc: 140,
    sales: 330,
    featured: false,
  },
  {
    name: 'Noir Silk Slip Dress',
    slug: 'noir-silk-slip-dress',
    description: 'Bias-cut silk blend with adjustable straps and a fluid drape.',
    catSlug: 'women',
    gender: 'women',
    tags: ['evening', 'silk'],
    price: 158,
    compare: 195,
    imgs: [IMG('photo-1595777457583-95e059d581b8'), IMG('photo-1496747611176-843222e1e57c')],
    sku: 'NSD',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [COL.blk, COL.rust],
    rating: 4.8,
    rc: 410,
    sales: 920,
    featured: true,
  },
  {
    name: 'Solstice Linen Blazer',
    slug: 'solstice-linen-blazer',
    description: 'Lightweight linen blend, half-lined interior, and soft shoulder.',
    catSlug: 'women',
    gender: 'women',
    tags: ['linen', 'blazer'],
    price: 185,
    imgs: [IMG('photo-1594633312681-425c7b97ccd1'), IMG('photo-1485968579580-b6d095142e6e')],
    sku: 'SLB',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [COL.sage, COL.wht, COL.navy],
    rating: 4.5,
    rc: 260,
    sales: 540,
    featured: false,
  },
  {
    name: 'Pulse Ribbed Knit Set',
    slug: 'pulse-ribbed-knit-set',
    description: 'Matching ribbed top and skirt with subtle sheen and stretch recovery.',
    catSlug: 'women',
    gender: 'women',
    tags: ['set', 'knit'],
    price: 124,
    imgs: [IMG('photo-1515372039744-b8f02a3cd446'), IMG('photo-1469334031218-e382a71b716b')],
    sku: 'PRK',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [COL.blk, COL.wht],
    rating: 4.6,
    rc: 330,
    sales: 780,
    featured: false,
  },
  {
    name: 'Sprout Kids Windbreaker',
    slug: 'sprout-kids-windbreaker',
    description: 'Color-block shell, mesh lining, and reflective hits for visibility.',
    catSlug: 'kids',
    gender: 'kids',
    tags: ['kids', 'outerwear'],
    price: 54,
    imgs: [IMG('photo-1503454537195-1dcabb73ffb9'), IMG('photo-1522771739844-6a9f6d5f14af')],
    sku: 'SKW',
    sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
    colors: [COL.navy, COL.sage],
    rating: 4.7,
    rc: 120,
    sales: 410,
    featured: false,
  },
  {
    name: 'Mini Trek Fleece Set',
    slug: 'mini-trek-fleece-set',
    description: 'Ultra-soft fleece hoodie and jogger with reinforced knees.',
    catSlug: 'kids',
    gender: 'kids',
    tags: ['fleece', 'set'],
    price: 48,
    imgs: [IMG('photo-1519238263530-99bdd9d43bb9'), IMG('photo-1514090458221-65bb69cf63e6')],
    sku: 'MTF',
    sizes: ['4Y', '6Y', '8Y', '10Y'],
    colors: [COL.blk, COL.wht],
    rating: 4.8,
    rc: 210,
    sales: 600,
    featured: true,
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected. Clearing collections...');
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    User.deleteMany({ email: { $in: ['admin@atlas.dev', 'demo@atlas.dev']  } }),
  ]);

  const cats = await Category.insertMany(categories);
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]));

  const rows = catalog.map((p) => {
    const r = productRow(p);
    r.category = bySlug[r.category];
    delete r.catSlug;
    return r;
  });
  await Product.insertMany(rows);

  await Coupon.create([
    {
      code: 'WELCOME10',
      description: '10% off first order',
      discountType: 'percent',
      discountValue: 10,
      minOrderValue: 50,
      maxDiscount: 40,
      usageLimit: 10000,
      isActive: true,
    },
    {
      code: 'SHIPFREE',
      description: '$15 off orders over $75',
      discountType: 'fixed',
      discountValue: 15,
      minOrderValue: 75,
      isActive: true,
    },
  ]);

  await User.create([
    {
      name: 'Atlas Admin',
      email: 'admin@atlas.dev',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true,
    },
    {
      name: 'Demo Shopper',
      email: 'demo@atlas.dev',
      password: 'Demo12345!',
      role: 'user',
      isEmailVerified: true,
    },
  ]);

  console.log('Seed complete.');
  console.log('Admin: admin@atlas.dev / Admin123!');
  console.log('Demo: demo@atlas.dev / Demo12345!');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
