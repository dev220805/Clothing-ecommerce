import { Outlet, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
];

function AdminLayout() {
  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 md:px-6">
        <aside className="hidden w-56 shrink-0 flex-col gap-1 rounded-2xl border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900 md:flex">
          <Link to="/" className="mb-4 px-3 font-display text-lg font-bold">
            Atlas<span className="text-accent">.</span>
          </Link>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-ink-950 text-white dark:bg-white dark:text-ink-950'
                    : 'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </aside>
        <div className="min-w-0 flex-1 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export { AdminLayout };
export default AdminLayout;
