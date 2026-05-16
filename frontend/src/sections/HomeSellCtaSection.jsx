import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

/** Below-fold homepage CTA — separate chunk from hero. */
export default function HomeSellCtaSection() {
  return (
    <section className="border-b border-ink-200 bg-ink-50/80 dark:border-ink-800 dark:bg-ink-900/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="max-w-xl space-y-3">
          <h2 className="font-display text-2xl font-bold md:text-3xl">List items from your closet</h2>
          <p className="text-ink-600 dark:text-ink-400">
            Add category, price, photos, and details — your listing is stored in our database and appears in the shop
            immediately. Manage everything from My listings.
          </p>
        </div>
        <Link to="/sell">
          <Button>List a product</Button>
        </Link>
      </div>
    </section>
  );
}
