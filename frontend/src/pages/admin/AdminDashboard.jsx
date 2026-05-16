import { useEffect, useState } from 'react';
import api from '@/api/client';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading analytics…</p>;

  const max = Math.max(1, ...(data.salesByDay || []).map((d) => d.total || 0));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
          <p className="text-xs uppercase text-ink-500">Revenue (30d)</p>
          <p className="mt-1 font-display text-2xl font-bold">{formatPrice(data.stats.revenue30d)}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
          <p className="text-xs uppercase text-ink-500">Orders (30d)</p>
          <p className="mt-1 font-display text-2xl font-bold">{data.stats.orders30d}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
          <p className="text-xs uppercase text-ink-500">Total users</p>
          <p className="mt-1 font-display text-2xl font-bold">{data.stats.totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
          <p className="text-xs uppercase text-ink-500">Total orders</p>
          <p className="mt-1 font-display text-2xl font-bold">{data.stats.totalOrders}</p>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold">Sales (30 days)</h2>
        <div className="mt-4 flex h-40 items-end gap-1">
          {(data.salesByDay || []).map((d) => (
            <div key={d._id} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-[20px] rounded-t bg-accent/80"
                style={{ height: `${(d.total / max) * 100}%`, minHeight: d.total ? 4 : 0 }}
                title={`${d._id}: ${formatPrice(d.total)}`}
              />
              <span className="rotate-45 text-[8px] text-ink-400">{d._id.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold">Top products</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(data.topProducts || []).map((p) => (
              <li key={p._id} className="flex justify-between">
                <span>{p.name}</span>
                <span className="text-ink-500">{p.salesCount} sold</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(data.recentOrders || []).map((o) => (
              <li key={o._id} className="flex justify-between">
                <span className="font-mono">{o.orderNumber}</span>
                <span>{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
