import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../features/auth/hooks.js';
import { PageLoader } from '../components/ui/PageLoader.jsx';

export function ProtectedRoute({ children }) {
  const { data: user, isPending, isError } = useSession();
  if (isPending) return <PageLoader />;
  if (isError || !user) return <Navigate to="/login" replace />;
  return children || <Outlet />;
}
