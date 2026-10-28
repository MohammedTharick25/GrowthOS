import { Navigate } from 'react-router-dom';
import { useSession } from '../features/auth/hooks.js';
import { PageLoader } from '../components/ui/PageLoader.jsx';

export function PublicRoute({ children }) {
  const { data: user, isPending } = useSession();
  if (isPending) return <PageLoader />;
  if (user) return <Navigate to="/app" replace />;
  return children;
}
