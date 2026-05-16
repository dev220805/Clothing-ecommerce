/** Cloudinary transforms: AVIF/WebP via f_auto, responsive width, perceptual quality */
const CLOUDINARY_HOST = 'res.cloudinary.com';

/** Unsplash Imgix-style params optimize delivery on mobile */
function optimizeUnsplashUrl(urlStr, width, quality = 72) {
  try {
    const u = new URL(urlStr);
    if (!u.hostname.includes('unsplash.com')) return urlStr;
    u.searchParams.set('auto', 'format'); // fm from auto
    u.searchParams.set('fit', 'crop');
    u.searchParams.set('crop', 'entropy');
    u.searchParams.set('w', String(Math.min(width, 1920)));
    u.searchParams.set('q', String(quality));
    u.searchParams.set('fm', 'webp');
    return u.toString();
  } catch {
    return urlStr;
  }
}

function optimizeCloudinaryUrl(urlStr, width) {
  try {
    const u = new URL(urlStr);
    if (!u.hostname.includes(CLOUDINARY_HOST)) return urlStr;
    const pathname = u.pathname;
    const uploadMarker = '/upload/';
    const idx = pathname.indexOf(uploadMarker);
    if (idx === -1) return urlStr;
    const after = pathname.slice(idx + uploadMarker.length);
    if (after.includes('f_auto') || after.includes('q_auto')) return urlStr;
    const w = Math.min(width, 2000);
    const trans = `f_auto,q_auto,w_${w},c_limit`;
    u.pathname = `${pathname.slice(0, idx + uploadMarker.length)}${trans}/${after}`;
    return u.toString();
  } catch {
    return urlStr;
  }
}

/**
 * Single responsive URL tuned for raster delivery (CDN / Unsplash).
 * Does not mutate Supabase/other arbitrary URLs aggressively.
 */
export function optimizeRetailImage(url, width, quality = 72) {
  if (!url || typeof url !== 'string') return url;
  const w = Math.max(96, Math.min(Number(width) || 640, 2000));

  if (url.includes('/upload/') && url.includes(CLOUDINARY_HOST)) {
    return optimizeCloudinaryUrl(url, w);
  }
  if (url.includes('images.unsplash.com') || url.includes('unsplash.com')) {
    return optimizeUnsplashUrl(url, w, quality);
  }
  try {
    const u = new URL(url);
    if (u.pathname.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)) return url;
    u.searchParams.set('w', String(w));
    if (!u.searchParams.has('q')) u.searchParams.set('q', String(quality));
    return u.toString();
  } catch {
    return url;
  }
}

/** Canonical widths for responsive srcSet (covers mobile → desktop 2× DPR). */
export const PRODUCT_CARD_WIDTHS = [240, 400, 600];
export const HERO_IMAGE_WIDTHS = [400, 640, 828, 1080];
/** PDP primary gallery — mobile-first widths */
export const PDP_MAIN_WIDTHS = [480, 720, 960, 1280];

export function buildSrcSet(url, widths) {
  if (!url) return '';
  const parts = widths.map((w) => `${optimizeRetailImage(url, w)} ${w}w`).filter(Boolean);
  return parts.join(', ');
}

/** Default responsive hint for grids / PDP gallery */
export const SIZES_PRODUCT_CARD = '(max-width:640px) 45vw,(max-width:1024px) 33vw,25vw';

export const SIZES_HERO = '(max-width:768px) 100vw,50vw';

export const SIZES_PDP_MAIN = '(max-width:768px) 92vw,45vw';
