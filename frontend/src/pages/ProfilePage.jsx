import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ line1: '', city: '', state: '', postalCode: '', fullName: '', phone: '' });

  useEffect(() => {
    api.get('/auth/me').then((res) => setUser(res.data.user));
  }, []);

  async function addAddress(e) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/me/addresses', form);
      setUser((u) => ({ ...u, addresses: res.data.addresses }));
      toast.success('Address saved');
      setForm({ line1: '', city: '', state: '', postalCode: '', fullName: '', phone: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  }

  if (!user) return <div className="p-10 text-center">Loading…</div>;

  return (
    <>
      <Helmet>
        <title>Account — Atlas Commerce</title>
      </Helmet>
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-ink-600 dark:text-ink-400">
          {user.name} · {user.email} {user.isEmailVerified ? '✓ Verified' : '(unverified)'}
        </p>
        <h2 className="mt-10 font-display text-xl font-semibold">Addresses</h2>
        <ul className="mt-4 space-y-2">
          {(user.addresses || []).map((a) => (
            <li key={a._id} className="rounded-xl border border-ink-200 p-3 text-sm dark:border-ink-800">
              {a.fullName && <p className="font-medium">{a.fullName}</p>}
              <p>
                {a.line1}, {a.city}, {a.state} {a.postalCode}
              </p>
            </li>
          ))}
        </ul>
        <form onSubmit={addAddress} className="mt-6 space-y-2">
          <p className="text-sm font-medium">Add address</p>
          {['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'].map((f) => (
            <input
              key={f}
              required={f !== 'phone'}
              placeholder={f}
              className="w-full rounded-lg border px-3 py-2 dark:border-ink-700 dark:bg-ink-900"
              value={form[f]}
              onChange={(e) => setForm((x) => ({ ...x, [f]: e.target.value }))}
            />
          ))}
          <Button type="submit">Save address</Button>
        </form>
      </div>
    </>
  );
}
