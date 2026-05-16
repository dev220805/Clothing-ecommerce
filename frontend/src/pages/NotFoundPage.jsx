import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Atlas Commerce</title>
      </Helmet>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="animate-fade-slide font-display text-7xl font-bold motion-reduce:animate-none motion-reduce:opacity-100">404</h1>
        <p className="mt-4 text-ink-600 dark:text-ink-400">This page drifted off the runway.</p>
        <Link to="/" className="mt-8 rounded-full bg-accent px-6 py-2 font-semibold text-white">
          Back home
        </Link>
      </div>
    </>
  );
}
