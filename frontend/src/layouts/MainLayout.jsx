import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

const Footer = lazy(() => import('@/components/Footer').then((m) => ({ default: m.Footer })));

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50 text-ink-950 dark:bg-ink-950 dark:text-ink-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Suspense
        fallback={
          <footer className="mt-24 h-48 border-t border-ink-200 dark:border-ink-800" aria-hidden />
        }
      >
        <Footer />
      </Suspense>
    </div>
  );
}
