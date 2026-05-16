import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pencil, Trash2 } from 'lucide-react';

export default function MyListingsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get('/listings/mine')
      .then((res) => setItems(res.data.data || []))
      .catch(() => toast.error('Could not load listings'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id, name) {
    if (!window.confirm(`Remove “${name}” from the shop? This cannot be undone.`)) return;
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing removed');
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <>
      <Helmet>
        <title>My listings — Atlas Commerce</title>
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">My listings</h1>
            <p className="mt-2 text-ink-600 dark:text-ink-400">
              Products you added are stored in the database. Edit details, hide, or delete them here.
            </p>
          </div>
          <Link to="/sell">
            <Button>Add product</Button>
          </Link>
        </div>

        {loading ? (
          <ul className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-24 rounded-2xl" />
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-ink-300 p-10 text-center dark:border-ink-700">
            <p className="text-ink-700 dark:text-ink-300">You have not listed any products yet.</p>
            <Link to="/sell" className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
              List your first item
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {items.map((p) => {
              const img = p.images?.[0]?.url;
              const stock = p.variants?.[0]?.stock ?? 0;
              return (
                <li
                  key={p._id}
                  className="flex flex-col gap-4 rounded-2xl border border-ink-200 p-4 sm:flex-row sm:items-center dark:border-ink-800"
                >
                  <div className="flex flex-1 gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-900">
                      {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <Link to={`/products/${p.slug}`} className="font-semibold text-accent hover:underline">
                        {p.name}
                      </Link>
                      <p className="text-sm text-ink-500">
                        {p.category?.name} · {formatPrice(p.basePrice)} · Stock {stock}
                        {!p.isActive ? <span className="ml-2 text-amber-600">Hidden</span> : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      to={`/my-listings/${p._id}/edit`}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold transition-colors dark:border-ink-700',
                        'hover:bg-ink-100 dark:hover:bg-ink-900'
                      )}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <Button type="button" variant="ghost" className="gap-2 text-red-600" onClick={() => remove(p._id, p.name)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
