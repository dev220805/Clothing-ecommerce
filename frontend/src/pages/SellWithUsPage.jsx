import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';

const initial = {
  categorySlug: '',
  name: '',
  description: '',
  basePrice: '',
  compareAtPrice: '',
  gender: 'unisex',
  size: '',
  color: '',
  stock: '1',
  imageUrl: '',
  tags: '',
};

export default function SellWithUsPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/products/categories').then((res) => setCategories(res.data.data || []));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        stock: Number(form.stock),
        compareAtPrice: form.compareAtPrice === '' ? undefined : Number(form.compareAtPrice),
        imageUrl: form.imageUrl.trim() || undefined,
        tags: form.tags.trim() || undefined,
      };
      const res = await api.post('/listings', payload);
      toast.success('Your product is live in the shop');
      navigate(`/products/${res.data.data.slug}`);
    } catch (err) {
      const msg = err.response?.data?.message;
      const details = err.response?.data?.details;
      if (Array.isArray(details) && details.length) {
        toast.error(details.map((d) => d.msg).join(' · ') || msg || 'Failed');
      } else {
        toast.error(msg || 'Could not create listing');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>List a product — Atlas Commerce</title>
        <meta
          name="description"
          content="Add your clothing or accessories to Atlas. Choose category, price, and details — stored in our catalog."
        />
      </Helmet>
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Sell on Atlas</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">List a product</h1>
        <p className="mt-4 text-ink-600 dark:text-ink-400">
          Products you add are saved in the database and appear in the shop like the rest of the catalog. You can edit or
          remove them anytime from{' '}
          <Link to="/my-listings" className="font-semibold text-accent hover:underline">
            My listings
          </Link>
          .
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div>
            <label htmlFor="categorySlug" className="text-sm font-medium">
              Category
            </label>
            <select
              id="categorySlug"
              required
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
              value={form.categorySlug}
              onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Product title
            </label>
            <input
              id="name"
              required
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description &amp; details
            </label>
            <textarea
              id="description"
              required
              rows={5}
              minLength={10}
              placeholder="Brand, fit, fabric, flaws, why you’re selling…"
              className="mt-1 w-full resize-y rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="basePrice" className="text-sm font-medium">
                Price (USD)
              </label>
              <input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                required
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="compareAtPrice" className="text-sm font-medium">
                Compare-at price <span className="font-normal text-ink-500">(optional)</span>
              </label>
              <input
                id="compareAtPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Original retail"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
                value={form.compareAtPrice}
                onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label htmlFor="gender" className="text-sm font-medium">
              Who it&apos;s for
            </label>
            <select
              id="gender"
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
            >
              <option value="unisex">Unisex</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="size" className="text-sm font-medium">
                Size
              </label>
              <input
                id="size"
                required
                placeholder="M, 10, OS…"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
                value={form.size}
                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="color" className="text-sm font-medium">
                Color
              </label>
              <input
                id="color"
                required
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="stock" className="text-sm font-medium">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                max="999"
                required
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label htmlFor="imageUrl" className="text-sm font-medium">
              Photo URL <span className="font-normal text-ink-500">(optional)</span>
            </label>
            <input
              id="imageUrl"
              type="url"
              placeholder="https://…"
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
            <p className="mt-1 text-xs text-ink-500">If empty, a default image is used until you add a link.</p>
          </div>
          <div>
            <label htmlFor="tags" className="text-sm font-medium">
              Tags <span className="font-normal text-ink-500">(optional, comma-separated)</span>
            </label>
            <input
              id="tags"
              placeholder="vintage, streetwear, cotton"
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none ring-accent/20 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Publishing…' : 'Publish to shop'}
            </Button>
            <Link to="/my-listings">
              <Button type="button" variant="ghost">
                My listings
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
