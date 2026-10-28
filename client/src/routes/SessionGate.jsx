import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../lib/axios.js';
import { setSession, setSessionStatus } from '../store/slices/sessionSlice.js';

let sessionRequest;
export function SessionGate({ children, publicOnly = false }) {
  const status = useSelector((state) => state.session.status);
  const user = useSelector((state) => state.session.user);
  const expired = useSelector((state) => state.session.expired);
  const location = useLocation();
  const dispatch = useDispatch();
  useEffect(() => {
    if (status !== 'unknown') return;
    dispatch(setSessionStatus('checking'));
    sessionRequest ||= api.get('/auth/v1/me').then(({ data }) => dispatch(setSession(data.data.user)))
      .catch(() => dispatch(setSession(null))).finally(() => { sessionRequest = null; });
  }, [status, dispatch]);
  if (status === 'unknown' || status === 'checking') return <div className="route-loading" aria-label="Checking session"><span /></div>;
  if (status === 'authenticated' && user?.onboardingDone === false && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  if (publicOnly && status === 'authenticated') return <Navigate to={user?.onboardingDone === false ? '/onboarding' : '/app'} replace />;
  if (!publicOnly && status !== 'authenticated') return <Navigate to="/login" replace state={{ sessionExpired: expired }} />;
  return children;
}
