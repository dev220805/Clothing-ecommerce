import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@/api/client';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => {
    api.get(`/orders/track/${orderNumber}`).then((res) => setOrder(res.data.order));
  }, [orderNumber]);

  if (!order) return <div className="p-10 text-center">Loading…</div>;

  return (
    <>
      <Helmet>
        <title>Order {order.orderNumber}</title>
      </Helmet>
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <Link to="/orders" className="text-sm text-accent">
          ← Orders
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold">{order.orderNumber}</h1>
        <p className="text-sm text-ink-500">Status: {order.status}</p>
        <ul className="mt-6 space-y-3">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>
                {it.name} × {it.quantity}
              </span>
              <span>{formatPrice(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-semibold">Total {formatPrice(order.total)}</p>
        <div className="mt-8">
          <h2 className="font-semibold">Timeline</h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-600 dark:text-ink-400">
            {(order.statusHistory || []).map((h, i) => (
              <li key={i}>
                {h.status} — {new Date(h.at).toLocaleString()}
                {h.note ? ` · ${h.note}` : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
