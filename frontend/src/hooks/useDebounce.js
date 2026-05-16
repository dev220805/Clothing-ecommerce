import { useEffect, useState, useCallback } from 'react';

export function useDebounce(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function useInfiniteScroll(fetchMore, hasMore, loading) {
  const ref = useCallback(
    (node) => {
      if (!node || loading || !hasMore) return;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) fetchMore();
        },
        { rootMargin: '200px' }
      );
      obs.observe(node);
      return () => obs.disconnect();
    },
    [fetchMore, hasMore, loading]
  );
  return ref;
}
