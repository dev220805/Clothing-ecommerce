import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/api/client';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [done, setDone] = useState(false);
  const email = params.get('email') || '';
  const token = params.get('token') || '';

  useEffect(() => {
    if (!email || !token) return;
    api
      .post('/auth/verify-email', { email, token })
      .then(() => {
        setDone(true);
        toast.success('Email verified');
      })
      .catch(() => toast.error('Invalid or expired link'));
  }, [email, token]);

  return (
    <>
      <Helmet>
        <title>Verify email</title>
      </Helmet>
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Email verification</h1>
        <p className="mt-4 text-ink-600 dark:text-ink-400">{done ? 'You are verified.' : 'Verifying…'}</p>
        <Link to="/login" className="mt-6 inline-block text-accent underline">
          Sign in
        </Link>
      </div>
    </>
  );
}
