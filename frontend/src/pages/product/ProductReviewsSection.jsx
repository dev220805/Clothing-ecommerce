import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

export default function ProductReviewsSection({ slug, accessToken }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!slug) return;
    let cancel = false;
    const load = () => {
      import('@/api/client').then(({ default: api }) => {
        api.get(`/products/${slug}/reviews`).then((res) => {
          if (!cancel) setReviews(res.data.data || []);
        });
      });
    };
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(load, { timeout: 2200 });
      return () => {
        cancel = true;
        cancelIdleCallback(id);
      };
    }
    const t = setTimeout(load, 120);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [slug]);

  async function submitReview(e) {
    e.preventDefault();
    if (!accessToken) return toast.error('Sign in to review');
    const fd = new FormData(e.target);
    const { default: api } = await import('@/api/client');
    const { default: toastLib } = await import('react-hot-toast');
    try {
      await api.post(`/products/${slug}/reviews`, {
        rating: Number(fd.get('rating')),
        title: fd.get('title'),
        comment: fd.get('comment'),
      });
      toastLib.success('Review posted');
      e.target.reset();
      const res = await api.get(`/products/${slug}/reviews`);
      setReviews(res.data.data || []);
    } catch (err) {
      toastLib.error(err.response?.data?.message || 'Failed');
    }
  }

  return (
    <section className="mt-16 border-t border-ink-200 pt-12 dark:border-ink-800">
      <h2 className="font-display text-2xl font-bold">Reviews</h2>
      {accessToken ? (
        <form
          onSubmit={submitReview}
          className="mt-6 max-w-xl space-y-3 rounded-2xl border border-ink-200 p-4 dark:border-ink-800"
        >
          <input
            name="title"
            placeholder="Title (optional)"
            className="w-full rounded-lg border px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
          />
          <textarea
            name="comment"
            required
            placeholder="Your review"
            className="w-full rounded-lg border px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            rows={3}
          />
          <select name="rating" className="rounded-lg border px-3 py-2 dark:border-ink-700 dark:bg-ink-950">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
          <Button type="submit">Post review</Button>
        </form>
      ) : null}
      <ul className="mt-8 space-y-4">
        {reviews.map((r) => (
          <li key={r._id} className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{r.user?.name}</span>
              <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
              {r.isVerifiedPurchase ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">Verified</span>
              ) : null}
            </div>
            {r.title ? <p className="mt-1 font-medium">{r.title}</p> : null}
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-400">{r.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
