import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/products/categories').then((res) => setCategories(res.data.data || []));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/listings/${id}`)
      .then((res) => {
        const p = res.data.data;
        const v0 = p.variants?.[0];
        setForm({
          categorySlug: p.category?.slug || '',
          name: p.name,
          description: p.description,
          basePrice: String(p.basePrice),
          compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
          gender: p.gender || 'unisex',
          size: v0?.size || '',
          color: v0?.color || '',
          stock: String(v0?.stock ?? 0),
          imageUrl: p.images?.[0]?.url || '',
          tags: (p.tags || []).join(', '),
          isActive: p.isActive !== false,
        });
      })
      .catch(() => {
        toast.error('Listing not found');
        navigate('/my-listings');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    try {
      await api.patch(`/listings/${id}`, {
        categorySlug: form.categorySlug,
        name: form.name,
        description: form.description,
        basePrice: Number(form.basePrice),
        stock: Number(form.stock),
        gender: form.gender,
        size: form.size,
        color: form.color,
        compareAtPrice: form.compareAtPrice === '' ? null : Number(form.compareAtPrice),
        imageUrl: form.imageUrl.trim() || undefined,
        tags: form.tags.trim() || undefined,
        isActive: form.isActive,
      });
      toast.success('Listing updated');
      navigate('/my-listings');
    } catch (err) {
      const msg = err.response?.data?.message;
      const details = err.response?.data?.details;
      if (Array.isArray(details) && details.length) {
        toast.error(details.map((d) => d.msg).join(' · ') || msg || 'Failed');
      } else {
        toast.error(msg || 'Update failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="p-10 text-center text-ink-500">
        <Helmet>
          <title>Edit listing — Atlas</title>
        </Helmet>
        Loading…
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit listing — Atlas Commerce</title>
      </Helmet>
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-bold">Edit listing</h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-ink-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Visible in shop
            </label>
          </div>
          <div>
            <label htmlFor="categorySlug" className="text-sm font-medium">
              Category
            </label>
            <select
              id="categorySlug"
              required
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
              value={form.categorySlug}
              onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Title
            </label>
            <input
              id="name"
              required
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={5}
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="basePrice" className="text-sm font-medium">
                Price
              </label>
              <input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                required
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="compareAtPrice" className="text-sm font-medium">
                Compare-at (optional)
              </label>
              <input
                id="compareAtPrice"
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
                value={form.compareAtPrice}
                onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label htmlFor="gender" className="text-sm font-medium">
              Audience
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
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
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
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
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
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label htmlFor="imageUrl" className="text-sm font-medium">
              Photo URL
            </label>
            <input
              id="imageUrl"
              type="url"
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="tags" className="text-sm font-medium">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save changes'}
            </Button>
            <Link to="/my-listings">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
