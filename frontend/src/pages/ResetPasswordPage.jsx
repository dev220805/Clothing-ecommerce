import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get('email') || '';
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, password });
      toast.success('Password updated');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Reset password</title>
      </Helmet>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-2xl font-bold">New password</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="hidden" name="email" value={email} readOnly />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 dark:border-ink-700 dark:bg-ink-900"
            placeholder="New password"
          />
          <Button type="submit" loading={loading}>
            Update password
          </Button>
        </form>
      </div>
    </>
  );
}
