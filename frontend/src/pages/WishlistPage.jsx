import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { ProductCard } from '@/components/ProductCard';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api
      .get('/wishlist')
      .then((res) => setProducts(res.data.products || []))
      .catch(() => toast.error('Sign in to view wishlist'));
  }, []);

  return (
    <>
      <Helmet>
        <title>Wishlist — Atlas Commerce</title>
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-bold">Wishlist</h1>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}
