import { useState, useEffect } from 'react';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function AdminCoupons() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 0,
    maxDiscount: '',
    usageLimit: '',
    isActive: true,
  });

  async function load() {
    const res = await api.get('/admin/coupons');
    setRows(res.data.data || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    await api.post('/admin/coupons', {
      ...form,
      maxDiscount: form.maxDiscount === '' ? undefined : Number(form.maxDiscount),
      usageLimit: form.usageLimit === '' ? undefined : Number(form.usageLimit),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Coupons</h1>
      <form onSubmit={save} className="mt-6 grid max-w-lg gap-2">
        <input
          placeholder="CODE"
          className="rounded border px-3 py-2 uppercase dark:border-ink-700 dark:bg-ink-950"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
        />
        <select
          value={form.discountType}
          onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
          className="rounded border px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
        >
          <option value="percent">percent</option>
          <option value="fixed">fixed</option>
        </select>
        <input
          type="number"
          placeholder="value"
          className="rounded border px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
          value={form.discountValue}
          onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
        />
        <Button type="submit">Upsert coupon</Button>
      </form>
      <ul className="mt-8 space-y-2 text-sm">
        {rows.map((c) => (
          <li key={c._id} className="flex justify-between rounded border px-3 py-2 dark:border-ink-800">
            <span className="font-mono">{c.code}</span>
            <span>
              {c.discountType} {c.discountValue}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
