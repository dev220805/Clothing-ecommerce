import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { useSelector } from 'react-redux';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';
import { PDP_MAIN_WIDTHS, SIZES_PDP_MAIN } from '@/lib/images';
import { IconBag, IconHeart, IconStar } from '@/components/icons/NavIcons';

const ProductReviewsSection = lazy(() => import('@/pages/product/ProductReviewsSection'));
const ProductRelatedSection = lazy(() => import('@/pages/product/ProductRelatedSection'));

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { accessToken, user } = useSelector((s) => s.auth);
  const sellerUid = user?.id || user?._id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setData(res.data.data);
        const v0 = res.data.data?.variants?.[0];
        if (v0) {
          setSize(v0.size);
          setColor(v0.color);
        }
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const variant = useMemo(() => {
    if (!data?.variants) return null;
    return (
      data.variants.find((v) => v.size === size && v.color === color) ||
      data.variants.find((v) => v.size === size) ||
      data.variants[0]
    );
  }, [data, size, color]);

  const price = data && variant ? data.basePrice + (variant.priceModifier || 0) : 0;

  const colors = useMemo(() => {
    if (!data?.variants) return [];
    const m = new Map();
    data.variants.forEach((v) => {
      if (!m.has(v.color)) m.set(v.color, v.colorHex);
    });
    return [...m.entries()];
  }, [data]);

  const sizes = useMemo(() => {
    if (!data?.variants) return [];
    return [...new Set(data.variants.map((v) => v.size))];
  }, [data]);

  async function addCart() {
    if (!accessToken) {
      toast.error('Sign in to add to cart');
      return;
    }
    if (!variant) return;
    try {
      await api.post('/cart/items', {
        productId: data._id,
        variantSku: variant.sku,
        quantity: qty,
      });
      toast.success('Added to cart');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not add');
    }
  }

  async function toggleWish() {
    if (!accessToken) {
      toast.error('Sign in for wishlist');
      return;
    }
    try {
      await api.post('/wishlist/toggle', { productId: data._id });
      toast.success('Wishlist updated');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  }

  if (loading || !data) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 md:px-6">
        <Skeleton className="aspect-[3/4] rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const mainImg = variant?.image || data.images?.[0]?.url;

  return (
    <>
      <Helmet>
        <title>{data.name} — Atlas Commerce</title>
        <meta name="description" content={data.description?.slice(0, 160)} />
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl border border-ink-200 bg-ink-100 dark:border-ink-800 dark:bg-ink-900">
            {mainImg ? (
              <OptimizedImage
                src={mainImg}
                alt={data.name}
                widths={PDP_MAIN_WIDTHS}
                sizes={SIZES_PDP_MAIN}
                width={960}
                height={1280}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                imgClassName="block h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-accent">{data.category?.name}</p>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{data.name}</h1>
            {data.listedBy ? (
              <p className="mt-3 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-700 dark:border-ink-700 dark:bg-ink-900/40 dark:text-ink-300">
                Community listing — added by a seller on Atlas.{' '}
                {sellerUid && String(data.listedBy) === String(sellerUid) ? (
                  <Link to={`/my-listings/${data._id}/edit`} className="font-semibold text-accent hover:underline">
                    Edit your listing
                  </Link>
                ) : null}
              </p>
            ) : null}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-semibold">{formatPrice(price)}</span>
              {data.compareAtPrice && data.compareAtPrice > data.basePrice ? (
                <span className="text-lg text-ink-400 line-through">{formatPrice(data.compareAtPrice)}</span>
              ) : null}
              <span className="ml-auto flex items-center gap-1 text-amber-500">
                <IconStar className="h-4 w-4" filled />
                {data.ratingAvg} ({data.ratingCount})
              </span>
            </div>
            <p className="mt-6 leading-relaxed text-ink-600 dark:text-ink-400">{data.description}</p>

            <div className="mt-8 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-ink-500">Color</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map(([name, hex]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setColor(name)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                        color === name ? 'border-accent ring-2 ring-accent/30' : 'border-ink-200 dark:border-ink-700'
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: hex }} />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-ink-500">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`rounded-full border px-4 py-1.5 text-sm ${
                        size === s ? 'border-accent bg-accent text-white' : 'border-ink-200 dark:border-ink-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-ink-500" htmlFor="qty">
                  Qty
                </label>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  max={variant?.stock || 1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="w-20 rounded-lg border border-ink-200 bg-white px-2 py-1 dark:border-ink-700 dark:bg-ink-900"
                />
                <span className="text-sm text-ink-500">{variant ? `${variant.stock} in stock` : ''}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={addCart}>
                <IconBag className="h-4 w-4" />
                Add to cart
              </Button>
              <Button variant="ghost" type="button" onClick={toggleWish}>
                <IconHeart className="h-4 w-4" />
                Wishlist
              </Button>
            </div>
          </div>
        </div>

        <Suspense fallback={<Skeleton className="mt-16 h-48 rounded-2xl" />}>
          <ProductReviewsSection slug={slug} accessToken={accessToken} />
        </Suspense>

        <Suspense fallback={<Skeleton className="mt-16 h-64 rounded-2xl" />}>
          <ProductRelatedSection related={data.related || []} />
        </Suspense>
      </div>
    </>
  );
}
