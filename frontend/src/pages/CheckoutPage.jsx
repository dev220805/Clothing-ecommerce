import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestAddr, setGuestAddr] = useState({
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    api.get('/auth/me').then((res) => setAddresses(res.data.user?.addresses || []));
  }, []);

  const preview = useCallback(async () => {
    const res = await api.post('/orders/preview', {
      addressId: addressId || undefined,
      couponCode: coupon || undefined,
    });
    setSummary(res.data.summary);
  }, [addressId, coupon]);

  useEffect(() => {
    preview().catch(() => {});
  }, [preview]);

  async function placeOrder() {
    if (addresses.length && !addressId) {
      toast.error('Select a shipping address');
      return;
    }
    if (!addresses.length) {
      const { line1, city, state, postalCode, fullName } = guestAddr;
      if (!line1 || !city || !state || !postalCode || !fullName) {
        toast.error('Fill shipping fields');
        return;
      }
    }
    setLoading(true);
    try {
      const body = {
        couponCode: coupon || undefined,
        paymentProvider: 'cod',
        useDemoCheckout: true,
      };
      if (addressId) body.addressId = addressId;
      else if (!addresses.length) body.shippingAddress = guestAddr;
      await api.post('/orders/place', body);
      toast.success('Order placed');
      navigate('/orders');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Checkout — Atlas Commerce</title>
      </Helmet>
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-sm text-ink-500">
          Tax, shipping tiers, and coupons are computed server-side. Configure Stripe keys on the API for live card
          payments (`POST /api/orders/payment-intent`).
        </p>

        {addresses.length ? (
          <div className="mt-8">
            <label className="block text-sm font-medium">Saved address</label>
            <select
              value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-900"
            >
              <option value="">Select…</option>
              {addresses.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.line1}, {a.city}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-8 space-y-3 rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
            <p className="text-sm text-ink-600 dark:text-ink-400">
              No saved addresses. Enter shipping below or{' '}
              <Link to="/account" className="text-accent underline">
                save one on your profile
              </Link>
              .
            </p>
            {['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'].map((field) => (
              <input
                key={field}
                placeholder={field}
                className="w-full rounded-lg border px-3 py-2 dark:border-ink-700 dark:bg-ink-900"
                value={guestAddr[field]}
                onChange={(e) => setGuestAddr((g) => ({ ...g, [field]: e.target.value }))}
              />
            ))}
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium">Coupon</label>
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            className="mt-2 w-full rounded-xl border px-3 py-2 dark:border-ink-700 dark:bg-ink-900"
          />
        </div>

        {summary ? (
          <ul className="mt-8 space-y-2 rounded-2xl border border-ink-200 p-6 text-sm dark:border-ink-800">
            <li className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(summary.subtotal)}</span>
            </li>
            <li className="flex justify-between">
              <span>Discount</span>
              <span>-{formatPrice(summary.discount)}</span>
            </li>
            <li className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(summary.shipping)}</span>
            </li>
            <li className="flex justify-between">
              <span>Tax (est.)</span>
              <span>{formatPrice(summary.tax)}</span>
            </li>
            <li className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(summary.total)}</span>
            </li>
            <li className="text-xs text-ink-500">Free shipping progress: {summary.freeShippingProgress}%</li>
          </ul>
        ) : null}

        <div className="mt-8">
          <Button loading={loading} onClick={placeOrder}>
            Place order
          </Button>
        </div>
      </div>
    </>
  );
}
