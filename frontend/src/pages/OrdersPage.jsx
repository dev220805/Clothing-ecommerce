import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    api
      .get('/orders/mine')
      .then((res) => {
        if (!cancel) setOrders(res.data.data || []);
      })
      .catch(() => {
        if (!cancel) setError('Could not load orders.');
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Placed orders — Atlas Commerce</title>
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-bold">Placed orders</h1>
        <p className="mt-2 text-ink-600 dark:text-ink-400">Your completed and in-progress purchases.</p>

        {loading ? (
          <ul className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-28 rounded-2xl" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <p className="mt-8 text-ink-600 dark:text-ink-400">{error}</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-ink-300 bg-ink-50/50 p-10 text-center dark:border-ink-700 dark:bg-ink-900/30">
            <p className="text-ink-700 dark:text-ink-300">You have not placed any orders yet.</p>
            <Link to="/products" className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
              Browse the shop
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((o) => (
              <li key={o._id} className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link to={`/orders/${o.orderNumber}`} className="font-mono font-semibold text-accent hover:underline">
                    {o.orderNumber}
                  </Link>
                  <span className="rounded-full bg-ink-100 px-3 py-0.5 text-xs font-medium dark:bg-ink-800">{o.status}</span>
                </div>
                <p className="mt-2 text-sm text-ink-500">{new Date(o.createdAt).toLocaleString()}</p>
                <p className="mt-1 font-medium">{formatPrice(o.total)}</p>
                {o.trackingNumber ? (
                  <p className="mt-2 text-sm">
                    Tracking: {o.carrier} {o.trackingNumber}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
