import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineStatus() {
  const [offline, setOffline] = useState(() => !navigator.onLine);
  useEffect(() => {
    const online = () => setOffline(false);
    const offlineNow = () => setOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offlineNow);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offlineNow); };
  }, []);
  if (!offline) return null;
  return <div role="status" className="fixed inset-x-3 top-[4.5rem] z-40 mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-[var(--shadow-float)]"><WifiOff size={18} className="mt-0.5 shrink-0 text-[var(--coral)]"/><div><strong className="block text-sm">You’re offline</strong><span className="text-xs leading-relaxed text-[var(--muted)]">Habits already on this screen can be checked off and will sync when you reconnect. Plans and reflections need a connection.</span></div></div>;
}
