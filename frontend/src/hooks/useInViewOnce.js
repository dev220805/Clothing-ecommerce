import { useEffect, useRef, useState } from 'react';

const defaults = {
  root: null,
  rootMargin: '120px',
  threshold: 0,
};

/** Fires once when sentinel enters viewport — defers related grids & heavy sections */
export function useInViewOnce(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const merged = { ...defaults, ...options };
    const obs = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      setInView(true);
      obs.disconnect();
    }, merged);

    obs.observe(el);
    return () => obs.disconnect();
  }, [options.root, options.rootMargin, options.threshold]);

  return [ref, inView];
}
