import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { setCredentials } from '@/features/authSlice';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, rememberMe: remember });
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, remember }));
      toast.success('Account created — check email for verification');
      navigate('/');
    } catch (err) {
      toast.error(err.userMessage || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Create account — Atlas Commerce</title>
      </Helmet>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <h1 className="font-display text-3xl font-bold">Create account</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-ink-200 px-4 py-3 dark:border-ink-700 dark:bg-ink-900"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-ink-200 px-4 py-3 dark:border-ink-700 dark:bg-ink-900"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (8+ chars)"
            className="w-full rounded-xl border border-ink-200 px-4 py-3 dark:border-ink-700 dark:bg-ink-900"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Button type="submit" className="w-full" loading={loading}>
            Register
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
