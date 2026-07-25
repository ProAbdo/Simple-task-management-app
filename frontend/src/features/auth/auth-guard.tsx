import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/auth.context';

export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate replace to="/app" /> : <Outlet />;
}

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate replace state={{ from: location.pathname }} to="/login" />
  );
}

export function RootRedirect() {
  const { isAuthenticated } = useAuth();

  return <Navigate replace to={isAuthenticated ? '/app' : '/login'} />;
}
