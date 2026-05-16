import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@/api/client';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 24;

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const debouncedQ = useDebounce(q, 320);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!debouncedQ) {
      setData([]);
      setLoading(false);
      return;
    }
    let cancel = false;
    setLoading(true);
    api
      .get('/products', { params: { search: debouncedQ, limit: PAGE_SIZE } })
      .then((res) => {
        if (!cancel) setData(res.data.data || []);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [debouncedQ]);

  return (
    <>
      <Helmet>
        <title>Search: {q || 'Atlas Commerce'}</title>
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-bold">Search</h1>
        <p className="mt-2 text-ink-500">Query uses MongoDB text index on name, description, and tags.</p>
        {!q ? <p className="mt-8 text-ink-600">Enter a search from the navbar.</p> : null}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
            : data.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
        {!loading && debouncedQ && data.length === 0 ? (
          <p className="mt-8">
            No results.{' '}
            <Link to="/products" className="text-accent underline">
              Browse catalog
            </Link>
          </p>
        ) : null}
      </div>
    </>
  );
}
