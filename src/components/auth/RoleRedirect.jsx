import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getDefaultRouteByRole } from '../../utils/roleRedirect';

export default function RoleRedirect({ fallback = '/login' }) {
  const { user } = useAuth();
  return <Navigate to={user ? getDefaultRouteByRole(user.role) : fallback} replace />;
}
