import { Link } from 'react-router-dom';

const cols = [
  {
    title: 'Shop',
    links: [
      { to: '/products?category=men', label: 'Men' },
      { to: '/products?category=women', label: 'Women' },
      { to: '/products?category=kids', label: 'Kids' },
      { to: '/products?category=sneakers', label: 'Sneakers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/account', label: 'Account' },
      { to: '/orders', label: 'Placed orders' },
      { to: '/my-listings', label: 'My listings' },
      { to: '/sell', label: 'List a product' },
      { to: '/cart', label: 'Cart' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-2xl font-bold text-ink-950 dark:text-white">
            Atlas<span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-600 dark:text-ink-400">
            Premium fashion commerce reference stack — performance, security, and UX built for scale.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-ink-500">{c.title}</h4>
            <ul className="mt-4 space-y-2">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-ink-700 transition hover:text-accent dark:text-ink-300 dark:hover:text-accent-glow"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-200 py-6 text-center text-xs text-ink-500 dark:border-ink-800">
        © {new Date().getFullYear()} Atlas Commerce — portfolio / demo project.
      </div>
    </footer>
  );
}
