import { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '@/api/client';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';

/** Below-fold homepage: code-split chunk + idle-time fetch so LCP stays light. */
export default function HomeFeaturedSection() {
  const userId = useSelector((s) => s.auth.user?.id || s.auth.user?._id);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const cancelled = useRef(false);

  const mineById = useMemo(() => {
    if (!userId) return null;
    const uid = String(userId);
    return (product) => product.listedBy && String(product.listedBy) === uid;
  }, [userId]);

  useEffect(() => {
    cancelled.current = false;
    const fetchData = async () => {
      try {
        const res = await api.get('/products', { params: { featured: 'true', limit: 8 } });
        if (!cancelled.current) setFeatured(res.data.data || []);
      } finally {
        if (!cancelled.current) setLoading(false);
      }
    };

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(fetchData, { timeout: 2000 });
      return () => {
        cancelled.current = true;
        cancelIdleCallback(id);
      };
    }
    const t = setTimeout(fetchData, 0);
    return () => {
      cancelled.current = true;
      clearTimeout(t);
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Featured</h2>
          <p className="mt-1 text-ink-600 dark:text-ink-400">Hand-picked pieces with strong margins and inventory depth.</p>
        </div>
        <Link to="/products" className="text-sm font-semibold text-accent hover:underline">
          View all
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
          : featured.map((p) => (
              <ProductCard key={p._id} product={p} isMine={mineById ? mineById(p) : false} />
            ))}
      </div>
    </section>
  );
}
