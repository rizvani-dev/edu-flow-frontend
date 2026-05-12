import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import PageLoader from '../common/PageLoader';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Checking your access..." />;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
