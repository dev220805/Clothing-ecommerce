import { Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { HERO_IMAGE_WIDTHS, SIZES_HERO, buildSrcSet, optimizeRetailImage } from '@/lib/images';

const HomeFeaturedSection = lazy(() => import('@/sections/HomeFeaturedSection.jsx'));
const HomeSellCtaSection = lazy(() => import('@/sections/HomeSellCtaSection.jsx'));

/** Hero typography — CSS animations only on critical path (no heavy animation libs). */
function HeroBlock() {
  return (
    <div className="max-w-xl space-y-6">
      <p className="motion-reduce:!animate-none motion-reduce:!opacity-100 motion-reduce:!transform-none animate-fade-slide text-sm font-semibold uppercase tracking-[0.25em] text-accent">
        New season drop
      </p>
      <h1 className="motion-reduce:!animate-none motion-reduce:!opacity-100 motion-reduce:!transform-none animate-fade-slide-delay font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
        Engineered layers for{' '}
        <span className="bg-gradient-to-r from-accent to-amber-500 bg-clip-text text-transparent">city motion</span>
      </h1>
      <p className="motion-reduce:!animate-none motion-reduce:!opacity-100 animate-fade-in-delay text-lg text-ink-600 dark:text-ink-400">
        Performance fabrics, precise tailoring, and a checkout tuned for conversion — a full-stack commerce stack you can ship.
      </p>
      <div className="motion-reduce:!animate-none motion-reduce:!opacity-100 animate-fade-in-delay-lg flex flex-wrap gap-3">
        <Link to="/products">
          <Button>Shop collection</Button>
        </Link>
        <Link to="/products?category=sneakers">
          <Button variant="ghost">View sneakers</Button>
        </Link>
        <Link to="/sell">
          <Button variant="ghost">List a product</Button>
        </Link>
      </div>
    </div>
  );
}

const HERO_IMG =
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=828&q=70&fm=webp';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Atlas Commerce — Modern Fashion</title>
        <meta name="description" content="Discover curated apparel, sneakers, and outerwear." />
        <link
          rel="preload"
          as="image"
          href={optimizeRetailImage(HERO_IMG, 828)}
          imageSrcSet={buildSrcSet(HERO_IMG, HERO_IMAGE_WIDTHS)}
          imageSizes={SIZES_HERO}
        />
      </Helmet>

      <section className="relative overflow-hidden border-b border-ink-200 dark:border-ink-800">
        <div className="absolute inset-0 bg-grid-fade bg-[length:24px_24px] opacity-40 dark:opacity-20" aria-hidden />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:px-6 md:py-24">
          <HeroBlock />
          <div className="relative flex-1 motion-reduce:animate-none animate-hero-reveal">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl border border-ink-200 shadow-2xl shadow-ink-950/10 dark:border-ink-800">
              <OptimizedImage
                src={HERO_IMG}
                alt="Fashion hero — layered streetwear editorial"
                widths={HERO_IMAGE_WIDTHS}
                sizes={SIZES_HERO}
                width={828}
                height={1036}
                fetchPriority="high"
                loading="eager"
                imgClassName="will-change-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<section className="h-40 border-b border-ink-200 dark:border-ink-800" aria-hidden />}>
        <HomeSellCtaSection />
      </Suspense>

      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="mb-10 flex justify-between gap-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          </section>
        }
      >
        <HomeFeaturedSection />
      </Suspense>
    </>
  );
}
