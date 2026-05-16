import { memo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSearch } from '@/components/icons/NavIcons';
import { useDebounce } from '@/hooks/useDebounce';
import { optimizeRetailImage } from '@/lib/images';

/**
 * Desktop search + typeahead — lazy-loaded chunk; API only after focus with 2+ chars.
 */
function NavbarSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [active, setActive] = useState(false);
  const dq = useDebounce(q, 300);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!active || dq.length < 2) {
      setSuggestions([]);
      return;
    }
    let cancel = false;
    import('@/api/client').then(({ default: api }) => {
      api
        .get('/products/suggestions', { params: { q: dq } })
        .then((res) => {
          if (!cancel) setSuggestions(res.data.suggestions || []);
        })
        .catch(() => {});
    });
    return () => {
      cancel = true;
    };
  }, [dq, active]);

  useEffect(() => {
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSug(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={wrapRef} className="relative hidden max-w-md flex-1 md:block">
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setShowSug(true);
        }}
        onFocus={() => {
          setActive(true);
          setShowSug(true);
        }}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls="nav-search-results"
        aria-expanded={showSug && suggestions.length > 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && q.trim()) {
            navigate(`/search?q=${encodeURIComponent(q.trim())}`);
            setShowSug(false);
          }
        }}
        placeholder="Search products..."
        className="w-full rounded-full border border-ink-200 bg-ink-50 py-2 pl-10 pr-4 text-sm outline-none ring-accent/30 focus:ring-2 dark:border-ink-700 dark:bg-ink-900"
      />
      {showSug && suggestions.length > 0 ? (
        <ul
          id="nav-search-results"
          role="listbox"
          className="absolute z-40 mt-2 max-h-72 w-full origin-top overflow-auto rounded-2xl border border-ink-200 bg-white py-2 shadow-xl motion-safe:animate-fade-slide dark:border-ink-700 dark:bg-ink-900"
        >
          {suggestions.slice(0, 8).map((s) => (
            <li key={s.slug} role="option">
              <button
                type="button"
                onClick={() => {
                  navigate(`/products/${s.slug}`);
                  setShowSug(false);
                  setQ('');
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-ink-50 dark:hover:bg-ink-800"
              >
                {s.thumb ? (
                  <img
                    src={optimizeRetailImage(s.thumb, 80)}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : null}
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default memo(NavbarSearch);
