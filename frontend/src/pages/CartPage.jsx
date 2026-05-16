import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const res = await api.get('/cart');
    setCart(res.data.cart);
  }

  useEffect(() => {
    refresh().catch(() => toast.error('Sign in to view cart')).finally(() => setLoading(false));
  }, []);

  async function update(itemId, body) {
    try {
      const res = await api.patch(`/cart/items/${itemId}`, body);
      setCart(res.data.cart);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  }

  async function remove(itemId) {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data.cart);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  }

  if (loading) return <div className="p-10 text-center text-ink-500">Loading cart…</div>;
  if (!cart) return null;

  const active = cart.items.filter((i) => !i.savedForLater);
  const saved = cart.items.filter((i) => i.savedForLater);

  return (
    <>
      <Helmet>
        <title>Cart — Atlas Commerce</title>
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-bold">Your cart</h1>
        <div className="mt-8 space-y-4">
          {active.length === 0 ? (
            <p className="text-ink-600 dark:text-ink-400">
              Cart is empty.{' '}
              <Link className="text-accent underline" to="/products">
                Continue shopping
              </Link>
            </p>
          ) : null}
          {active.map((line) => {
            const p = line.product;
            const v = p?.variants?.find((x) => x.sku === line.variantSku);
            const unit = p ? p.basePrice + (v?.priceModifier || 0) : 0;
            return (
              <div
                key={line._id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-200 p-4 dark:border-ink-800"
              >
                {p?.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt="" className="h-24 w-20 rounded-lg object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${p?.slug}`} className="font-semibold hover:text-accent">
                    {p?.name}
                  </Link>
                  <p className="text-sm text-ink-500">
                    {v?.color} · {v?.size}
                  </p>
                  <p className="mt-1 font-medium">{formatPrice(unit)}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  className="w-16 rounded border px-2 py-1 dark:border-ink-700 dark:bg-ink-900"
                  defaultValue={line.quantity}
                  onBlur={(e) => update(line._id, { quantity: Number(e.target.value) })}
                />
                <Button variant="ghost" type="button" onClick={() => update(line._id, { savedForLater: true })}>
                  Save for later
                </Button>
                <Button variant="outline" type="button" onClick={() => remove(line._id)}>
                  Remove
                </Button>
              </div>
            );
          })}
        </div>

        {saved.length ? (
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold">Saved for later</h2>
            <div className="mt-4 space-y-3">
              {saved.map((line) => (
                <div key={line._id} className="flex items-center justify-between rounded-xl border border-dashed p-3">
                  <span>{line.product?.name}</span>
                  <Button type="button" variant="ghost" onClick={() => update(line._id, { savedForLater: false })}>
                    Move to cart
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {active.length ? (
          <div className="mt-10 flex justify-end">
            <Link to="/checkout">
              <Button>Checkout</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
