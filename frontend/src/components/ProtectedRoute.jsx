import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProtectedRoute({ children, admin }) {
  const { accessToken, user } = useSelector((s) => s.auth);
  const loc = useLocation();
  if (!accessToken) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (admin && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
