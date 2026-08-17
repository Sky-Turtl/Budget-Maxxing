import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

export function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const location = useLocation();

  if (authLoading || profileLoading) return <div className="page-loading">Loading…</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
