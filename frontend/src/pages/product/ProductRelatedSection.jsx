import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useInViewOnce } from '@/hooks/useInViewOnce';

export default function ProductRelatedSection({ related = [] }) {
  const [relatedRef, showRelated] = useInViewOnce();

  return (
    <section ref={relatedRef} className="mt-16 [content-visibility:auto]">
      <h2 className="font-display text-2xl font-bold">Related</h2>
      {!showRelated ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
