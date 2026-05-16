import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hydrateUser, clearAuth } from '@/features/authSlice';

export function AuthBootstrap() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const hydrate = () => {
      import('@/api/client').then(({ default: api }) => {
        api
          .get('/auth/me')
          .then((res) => {
            if (!cancelled) dispatch(hydrateUser(res.data.user));
          })
          .catch(() => {
            if (!cancelled) dispatch(clearAuth());
          });
      });
    };

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(hydrate, { timeout: 2500 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }

    const t = setTimeout(hydrate, 1);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [dispatch, token]);

  return null;
}
