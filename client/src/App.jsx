import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.jsx';
import SessionExpiredModal from './components/ui/SessionExpiredModal.jsx';
import OfflineStatus from './components/feedback/OfflineStatus.jsx';
import QualityTelemetry from './components/feedback/QualityTelemetry.jsx';

export default function App() {
  const theme = useSelector((state) => state.ui.theme);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => { document.documentElement.dataset.theme = theme === 'system' ? (preference.matches ? 'dark' : 'light') : theme; };
    applyTheme();
    if (theme !== 'system') return undefined;
    preference.addEventListener('change', applyTheme);
    return () => preference.removeEventListener('change', applyTheme);
  }, [theme]);

  return <><RouterProvider router={router} /><SessionExpiredModal /><OfflineStatus /><QualityTelemetry /></>;
}
