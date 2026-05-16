import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { setCredentials } from '@/features/authSlice';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password, rememberMe: remember });
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, remember }));
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Sign in — Atlas Commerce</title>
      </Helmet>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <h1 className="font-display text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-ink-500">Demo: demo@atlas.dev / Demo12345!</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-ink-200 px-4 py-3 dark:border-ink-700 dark:bg-ink-900"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Button type="submit" className="w-full" loading={loading}>
            Continue
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link to="/forgot-password" className="text-accent">
            Forgot password?
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-ink-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-accent">
            Create account
          </Link>
        </p>
      </div>
    </>
  );
}
