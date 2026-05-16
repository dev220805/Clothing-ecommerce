import { useEffect, useState } from 'react';
import api from '@/api/client';

export default function AdminProducts() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get('/admin/products').then((res) => setRows(res.data.data || []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Products</h1>
      <p className="mt-2 text-sm text-ink-500">Create/update flows use REST + optional Cloudinary upload (`POST /api/uploads/images`).</p>
      <ul className="mt-6 space-y-2 text-sm">
        {rows.map((p) => (
          <li key={p._id} className="flex justify-between rounded-xl border border-ink-200 px-3 py-2 dark:border-ink-800">
            <span>{p.name}</span>
            <span className="text-ink-500">{p.isActive ? 'active' : 'inactive'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
