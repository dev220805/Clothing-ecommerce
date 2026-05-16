import { useState, useEffect, memo, lazy, Suspense } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  IconMenu,
  IconX,
  IconBag,
  IconHeart,
  IconUser,
  IconSun,
  IconMoon,
  IconDashboard,
  IconLogOut,
  IconPackage,
} from '@/components/icons/NavIcons';
import { clearAuth } from '@/features/authSlice';
import { toggleTheme } from '@/features/uiSlice';
import { cn } from '@/lib/utils';

const NavbarSearch = lazy(() => import('@/components/nav/NavbarSearch'));

const nav = [
  { to: '/products?category=men', label: 'Men' },
  { to: '/products?category=women', label: 'Women' },
  { to: '/products?category=kids', label: 'Kids' },
  { to: '/products?category=sneakers', label: 'Sneakers' },
  { to: '/products?category=hoodies', label: 'Hoodies' },
  { to: '/sell', label: 'Sell' },
];

export const Navbar = memo(function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useSelector(
    (s) => ({ user: s.auth.user, accessToken: s.auth.accessToken }),
    shallowEqual
  );
  const theme = useSelector((s) => s.ui.theme);
  const [open, setOpen] = useState(false);
  const [mobileQ, setMobileQ] = useState('');
  const [searchReady, setSearchReady] = useState(false);

  useEffect(() => {
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setSearchReady(true), { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(() => setSearchReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  async function logout() {
    const { default: api } = await import('@/api/client');
    const { default: toast } = await import('react-hot-toast');
    try {
      await api.post('/auth/logout');
    } catch {
      /* */
    }
    dispatch(clearAuth());
    toast.success('Signed out');
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/80 bg-white/80 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-950/80">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-ink-950 dark:text-white">
          Atlas<span className="text-accent">.</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-ink-600 transition hover:text-ink-950 dark:text-ink-300 dark:hover:text-white',
                  isActive && 'text-accent'
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {searchReady ? (
          <Suspense fallback={<div className="hidden max-w-md flex-1 md:block" aria-hidden />}>
            <NavbarSearch />
          </Suspense>
        ) : (
          <div className="hidden max-w-md flex-1 md:block" aria-hidden />
        )}

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="rounded-full p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
          </button>
          {accessToken ? (
            <>
              <Link
                to="/my-listings"
                className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10 sm:block"
              >
                My listings
              </Link>
              <Link
                to="/wishlist"
                className="rounded-full p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
                aria-label="Wishlist"
              >
                <IconHeart className="h-5 w-5" />
              </Link>
              <Link
                to="/cart"
                className="rounded-full p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
                aria-label="Cart"
              >
                <IconBag className="h-5 w-5" />
              </Link>
              <Link
                to="/orders"
                className="hidden rounded-full p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 sm:block"
                aria-label="Placed orders"
                title="Placed orders"
              >
                <IconPackage className="h-5 w-5" />
              </Link>
              <Link
                to="/account"
                className="rounded-full p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
                aria-label="Account"
              >
                <IconUser className="h-5 w-5" />
              </Link>
              {user?.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="hidden rounded-full p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 sm:block"
                  aria-label="Admin dashboard"
                >
                  <IconDashboard className="h-5 w-5" />
                </Link>
              ) : null}
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-full p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 sm:block"
                aria-label="Logout"
              >
                <IconLogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-ink-100 dark:text-white dark:hover:bg-ink-800"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            className="rounded-full p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          'border-t border-ink-200 dark:border-ink-800 md:hidden motion-reduce:!animate-none',
          open ? 'block motion-safe:animate-fade-slide' : 'hidden'
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          <input
            value={mobileQ}
            onChange={(e) => setMobileQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && mobileQ.trim()) {
                navigate(`/search?q=${encodeURIComponent(mobileQ.trim())}`);
                setOpen(false);
              }
            }}
            placeholder="Search..."
            className="mb-2 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 dark:border-ink-700 dark:bg-ink-900"
          />
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              {n.label}
            </Link>
          ))}
          <Link to="/search" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm">
            Search results
          </Link>
          {accessToken ? (
            <Link to="/orders" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium">
              Placed orders
            </Link>
          ) : null}
          {accessToken ? (
            <Link to="/my-listings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium">
              My listings
            </Link>
          ) : null}
          {user?.role === 'admin' ? (
            <Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm">
              Admin
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
});
