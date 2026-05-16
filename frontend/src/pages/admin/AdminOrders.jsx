import { useEffect, useState } from 'react';
import api from '@/api/client';

export default function AdminOrders() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get('/admin/orders').then((res) => setRows(res.data.data || []));
  }, []);

  async function updateStatus(orderNumber, status) {
    await api.patch(`/admin/orders/${orderNumber}`, { status, note: 'Admin update' });
    const res = await api.get('/admin/orders');
    setRows(res.data.data || []);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Orders</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 dark:border-ink-800">
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o._id} className="border-b border-ink-100 dark:border-ink-800/80">
                <td className="py-2 font-mono text-xs">{o.orderNumber}</td>
                <td>{o.user?.email}</td>
                <td>${o.total}</td>
                <td>{o.status}</td>
                <td>
                  <select
                    className="rounded border px-2 py-1 text-xs dark:border-ink-700 dark:bg-ink-950"
                    value={o.status}
                    onChange={(e) => updateStatus(o.orderNumber, e.target.value)}
                  >
                    {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
