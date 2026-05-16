import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { IconStar } from '@/components/icons/NavIcons';
import { OptimizedImage } from '@/components/OptimizedImage';
import { PRODUCT_CARD_WIDTHS, SIZES_PRODUCT_CARD } from '@/lib/images';

export const ProductCard = memo(function ProductCard({ product, isMine = false }) {
  const img = product.images?.[0]?.url;
  const altText = `${product.name}${product.category?.name ? ` — ${product.category.name}` : ''}`;
  return (
    <article className="group relative [content-visibility:auto]">
      <Link to={`/products/${product.slug}`} className="block outline-none ring-accent/40 focus-visible:ring-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-900">
          {img ? (
            <OptimizedImage
              src={img}
              alt={altText}
              widths={PRODUCT_CARD_WIDTHS}
              sizes={SIZES_PRODUCT_CARD}
              width={400}
              height={533}
              loading="lazy"
              imgClassName="transition-transform duration-500 motion-reduce:transition-none motion-reduce:duration-0 will-change-transform group-hover:scale-105 md:will-change-auto"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
          {isMine ? (
            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-ink-800 dark:bg-ink-900/90 dark:text-ink-100">
              Yours
            </span>
          ) : null}
          {product.compareAtPrice && product.compareAtPrice > product.basePrice ? (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
              Sale
            </span>
          ) : null}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs uppercase tracking-widest text-ink-500">{product.category?.name}</p>
          <h3 className="font-display text-lg font-semibold leading-tight text-ink-950 dark:text-ink-50">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-medium">{formatPrice(product.basePrice)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.basePrice ? (
              <span className="text-sm text-ink-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            ) : null}
            <span className="ml-auto flex items-center gap-0.5 text-sm text-amber-500">
              <IconStar className="h-3.5 w-3.5" filled />
              <span>{product.ratingAvg?.toFixed(1) ?? '—'}</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
});
