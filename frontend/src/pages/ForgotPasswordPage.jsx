import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('If an account exists, instructions were sent.');
    } catch {
      toast.error('Request failed');
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Helmet>
        <title>Forgot password</title>
      </Helmet>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-2xl font-bold">Forgot password</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 dark:border-ink-700 dark:bg-ink-900"
            placeholder="Email"
          />
          <Button type="submit" loading={loading}>
            Send reset link
          </Button>
        </form>
      </div>
    </>
  );
}
