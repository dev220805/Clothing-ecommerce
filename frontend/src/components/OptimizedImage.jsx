import { memo } from 'react';
import { cn } from '@/lib/utils';
import { buildSrcSet, optimizeRetailImage } from '@/lib/images';

/** Layout-stable responsive image (srcSet + dims). Prefer transform/opacity on parent wrappers. */
function OptimizedImageInner({
  src,
  alt = '',
  widths,
  sizes,
  className,
  imgClassName,
  width,
  height,
  fetchPriority = 'auto',
  decoding = 'async',
  loading = 'lazy',
}) {
  if (!src) return null;

  const w = width || widths?.[Math.ceil(widths.length / 2) - 1] || 560;
  const defaultSrc = optimizeRetailImage(src, w);
  const srcSet = widths?.length ? buildSrcSet(src, widths) : undefined;

  return (
    <img
      src={defaultSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      className={cn('h-full w-full object-cover', imgClassName, className)}
    />
  );
}

export const OptimizedImage = memo(OptimizedImageInner);
