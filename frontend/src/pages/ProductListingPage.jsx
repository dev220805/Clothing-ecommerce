import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '@/api/client';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductListingPage() {
  const [params] = useSearchParams();
  const category = params.get('category') || '';
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(
    () => ({
      category: category || undefined,
      sort,
      page,
      limit: 12,
    }),
    [category, sort, page]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: query });
      setData((prev) => (page === 1 ? res.data.data : [...prev, ...res.data.data]));
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    setPage(1);
    setData([]);
  }, [category, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const hasMore = pagination && page < pagination.pages;

  return (
    <>
      <Helmet>
        <title>{category ? `${category} — Atlas` : 'Shop — Atlas Commerce'}</title>
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Catalog</p>
            <h1 className="font-display text-3xl font-bold capitalize md:text-4xl">{category || 'All products'}</h1>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top rated</option>
            <option value="popularity">Bestsellers</option>
          </select>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading && page === 1
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
            : data.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
        {hasMore ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="rounded-full border border-ink-300 px-8 py-2 text-sm font-semibold hover:border-accent dark:border-ink-600"
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          </div>
        ) : null}
        <p className="mt-6 text-center text-sm text-ink-500">
          Compound MongoDB indexes back category + sort queries. See repo README for API documentation.
        </p>
      </div>
    </>
  );
}
