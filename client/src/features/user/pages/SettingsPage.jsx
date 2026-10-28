import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, BellRing, Check, Clock3, LogOut, Moon, Sun, Monitor, Download, Trash2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/axios.js';
import { queryKeys } from '../../../lib/queryKeys.js';
import { setTheme } from '../../../store/slices/uiSlice.js';
import { clearSession, setSession } from '../../../store/slices/sessionSlice.js';
import { useLogout, useSession } from '../../auth/hooks.js';
import { Button } from '../../../components/ui/Button.jsx';
import { clearOfflineCheckins, getOfflineCheckins } from '../../../lib/offlineCheckins.js';

const themes = [
  { id: 'light', label: 'Light', description: 'A clear, warm canvas.', icon: Sun },
  { id: 'dark', label: 'Dark', description: 'Easy on the eyes at night.', icon: Moon },
  { id: 'system', label: 'System', description: 'Follow your device settings.', icon: Monitor },
];

export default function SettingsPage() {
  const theme = useSelector((state) => state.ui.theme);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [reminderTimes, setReminderTimes] = useState({ morning: '', evening: '', weekly: '' });
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [analyticsMessage, setAnalyticsMessage] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [clearingLocalData, setClearingLocalData] = useState(false);
  const [localDataMessage, setLocalDataMessage] = useState('');
  const navigate = useNavigate();
  const logout = useLogout();
  const profile = useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => (await api.get('/user/v1/profile')).data.data.user,
  });
  const updateTheme = useMutation({
    mutationFn: async (value) => (await api.put('/user/v1/theme', { theme: value })).data.data.user,
    onSuccess: (nextUser) => queryClient.setQueryData(queryKeys.profile, nextUser),
  });
  const updatePreferences = useMutation({
    mutationFn: async (preferences) => (await api.put('/user/v1/settings', preferences)).data.data.user,
    onSuccess: (nextUser) => {
      queryClient.setQueryData(queryKeys.profile, nextUser);
      queryClient.setQueryData(queryKeys.auth, nextUser);
      dispatch(setSession(nextUser));
    },
  });
  const updateAnalytics = useMutation({
    mutationFn: async (value) => (await api.put('/user/v1/settings', { analyticsOptIn: value })).data.data.user,
    onSuccess: (nextUser) => {
      queryClient.setQueryData(queryKeys.profile, nextUser);
      queryClient.setQueryData(queryKeys.auth, nextUser);
      dispatch(setSession(nextUser));
      setAnalyticsMessage(nextUser.analyticsOptIn ? 'Anonymous quality measurements are on.' : 'Quality measurements are off.');
    },
    onError: () => { setAnalyticsOptIn(Boolean(profile.data?.analyticsOptIn)); setAnalyticsMessage('We couldn’t update this preference. Try again.'); },
  });
  useEffect(() => {
    if (!profile.data) return;
    setTimezone(profile.data.timezone || user?.timezone || 'Asia/Kolkata');
    setReminderTimes({ morning: profile.data.reminderTimes?.morning || '', evening: profile.data.reminderTimes?.evening || '', weekly: profile.data.reminderTimes?.weekly || '' });
    setAnalyticsOptIn(Boolean(profile.data.analyticsOptIn));
  }, [profile.data, user?.timezone]);

  const selectTheme = (value) => {
    dispatch(setTheme(value));
    updateTheme.mutate(value);
  };

  async function deleteMyAccount(event) {
    event.preventDefault(); setDeleteError('');
    if (deletePhrase !== 'DELETE') { setDeleteError('Type DELETE exactly to confirm account removal.'); return; }
    setDeleting(true);
    try {
      await api.delete('/user/v1/account', { data: { password: deletePassword } });
      try { await clearOfflineCheckins(String(user?.id || profile.data?._id || '')); } catch { /* account removal has already succeeded */ }
      queryClient.clear(); dispatch(clearSession()); navigate('/', { replace: true });
    } catch (error) { setDeleteError(error.response?.data?.error?.message || 'We couldn’t delete your account. Try again.'); }
    finally { setDeleting(false); }
  }

  async function exportMyData() {
    setExporting(true); setExportError('');
    try {
      const [{ data }, pendingOfflineCheckins] = await Promise.all([
        api.get('/user/v1/data/export'),
        getOfflineCheckins(String(user?.id || '')).catch(() => []),
      ]);
      const payload = { ...data, pendingOfflineCheckins };
      const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = objectUrl; anchor.download = `growthos-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch { setExportError('We couldn’t prepare your export. Reconnect and try again.'); }
    finally { setExporting(false); }
  }

  async function clearPendingOfflineData() {
    if (!window.confirm('Clear this account’s pending offline habit check-ins from this device? They will not be uploaded.')) return;
    setClearingLocalData(true); setLocalDataMessage('');
    try { await clearOfflineCheckins(String(user?.id || '')); setLocalDataMessage('Pending offline check-ins cleared from this device.'); }
    catch { setLocalDataMessage('We couldn’t clear local check-ins. Try again.'); }
    finally { setClearingLocalData(false); }
  }

  return (
    <main className="settings-page">
      <Link to="/app" className="back-link settings-back"><ArrowLeft size={17} /> Back to today</Link>
      <span className="section-kicker">MAKE IT YOURS</span>
      <h1>Your settings</h1>
      <p className="settings-intro">A space that feels right for you.</p>
      <section className="settings-section">
        <div className="settings-section-heading"><div><h2>Appearance</h2><p>Choose how GrowthOS looks on this device.</p></div><span className="settings-status"><Check size={13} /> Saves automatically</span></div>
        <div className="theme-options">
          {themes.map(({ id, label, description, icon: Icon }) => (
            <button className={`theme-option ${theme === id ? 'selected' : ''}`} key={id} onClick={() => selectTheme(id)} aria-pressed={theme === id}>
              <span className="theme-option-icon"><Icon size={19} /></span><span className="theme-option-copy"><strong>{label}</strong><small>{description}</small></span><span className="radio-check">{theme === id && <Check size={13} />}</span>
            </button>
          ))}
        </div>
        {updateTheme.isError && <p className="settings-warning" role="alert">Your choice is saved on this device, but we couldn’t sync it to your account. Try again when you’re back online.</p>}
      </section>
      <section className="settings-section">
        <div className="settings-section-heading"><div><h2>Reminders & time zone</h2><p>Dates and reminder emails follow your local time.</p></div><Clock3 size={18} /></div>
        <form onSubmit={(event) => { event.preventDefault(); updatePreferences.mutate({ timezone, reminderTimes }); }} className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">Time zone<select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 text-sm text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)]">{[...new Set([timezone, 'Asia/Kolkata', 'Asia/Singapore', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'])].map((zone) => <option key={zone} value={zone}>{zone.replaceAll('_', ' ')}</option>)}</select></label>
          <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:p-5"><div className="flex items-center gap-2"><BellRing size={16} className="text-[var(--green)]"/><strong className="text-sm text-[var(--text)]">Optional email reminders</strong></div><p className="m-0 text-xs leading-relaxed text-[var(--muted)]">Choose a local send time. Leave a time blank to turn that reminder off. Email delivery must be configured by the app.</p>{[['morning','Morning plan'],['evening','Evening reflection'],['weekly','Weekly check-in']].map(([key,label]) => <label key={key} className="flex items-center justify-between gap-4 text-sm text-[var(--ink-soft)]">{label}<input type="time" value={reminderTimes[key]} onChange={(event) => setReminderTimes((current) => ({ ...current, [key]: event.target.value }))} className="min-h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]" /></label>)}</div>
          <div className="flex flex-wrap items-center justify-between gap-3">{updatePreferences.isSuccess && <span className="text-sm text-[var(--green)]" role="status">Preferences saved.</span>}{updatePreferences.isError && <span className="text-sm text-[var(--coral)]" role="alert">We couldn’t save these preferences. Try again.</span>}<Button className="ml-auto" type="submit" disabled={updatePreferences.isPending}>{updatePreferences.isPending ? 'Saving…' : 'Save preferences'}</Button></div>
        </form>
      </section>
      <section className="settings-section account-section">
        <div className="settings-section-heading"><div><h2>Your account</h2><p>Your details are yours, and easy to find.</p></div></div>
        <div className="account-details"><span className="avatar">{user?.name?.slice(0, 1).toUpperCase() || 'G'}</span><div><strong>{profile.data?.name || user?.name}</strong><small>{profile.data?.email || user?.email}</small></div></div>
      </section>
      <section className="settings-section">
        <div className="settings-section-heading"><div><h2>Your data & privacy</h2><p>Understand what GrowthOS stores and choose what you share.</p></div><ShieldCheck size={18} /></div>
        <div className="grid gap-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:p-5"><strong className="text-sm text-[var(--text)]">Data in your account</strong><p className="mb-0 mt-2 text-xs leading-relaxed text-[var(--muted)]">GrowthOS stores your profile and settings, identity statements, habits and check-ins, daily plans, reflections, study and courage notes, finance entries, and progress records. Passwords are stored as one-way hashes. Authentication tokens are never included in exports. If you check off a habit offline, this browser temporarily stores only your account ID, habit ID, date, and completion state until it syncs or you clear it.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={exportMyData} disabled={exporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--green)] hover:border-[var(--green)] disabled:opacity-60"><Download size={16}/>{exporting ? 'Preparing your export…' : 'Download my data'}</button><button type="button" onClick={clearPendingOfflineData} disabled={clearingLocalData} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--muted)] hover:border-[var(--green)] disabled:opacity-60">{clearingLocalData ? 'Clearing…' : 'Clear pending offline check-ins'}</button></div>{exportError && <p className="mb-0 mt-3 text-xs text-[var(--coral)]" role="alert">{exportError}</p>}{localDataMessage && <p className="mb-0 mt-3 text-xs text-[var(--muted)]" role="status">{localDataMessage}</p>}</div>
          <div className="rounded-2xl border border-[var(--line)] p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div><strong className="text-sm text-[var(--text)]">Anonymous quality measurements</strong><p className="mb-0 mt-1 text-xs leading-relaxed text-[var(--muted)]">Optional aggregate app error counts and page-speed measurements (LCP, CLS, INP, TTFB), retained for up to 90 days. No user ID, journal text, habit names, page URL, or error message is collected. Off by default; turning it off stops new measurements.</p></div><input aria-label="Share anonymous quality measurements" type="checkbox" checked={analyticsOptIn} disabled={updateAnalytics.isPending} onChange={(event) => { setAnalyticsOptIn(event.target.checked); setAnalyticsMessage(''); updateAnalytics.mutate(event.target.checked); }} className="mt-1 size-5 accent-[var(--green)]" /></div>{analyticsMessage && <p className="mb-0 mt-3 text-xs text-[var(--green)]" role="status">{analyticsMessage}</p>}</div>
          <div className="rounded-2xl border border-[color-mix(in_srgb,var(--coral)_35%,var(--line))] p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div><strong className="text-sm text-[var(--text)]">Delete your account</strong><p className="mb-0 mt-1 text-xs leading-relaxed text-[var(--muted)]">Permanently removes your profile and personal practice records. This cannot be undone.</p></div><button type="button" onClick={() => { setDeleteOpen((open) => !open); setDeleteError(''); }} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-[var(--coral)] px-3 text-xs font-semibold text-[var(--coral)]"><Trash2 size={15}/>{deleteOpen ? 'Cancel' : 'Delete'}</button></div>
            {deleteOpen && <form onSubmit={deleteMyAccount} className="mt-4 grid gap-3 border-t border-[var(--line)] pt-4"><p className="mb-0 text-xs font-semibold text-[var(--coral)]">To confirm, type DELETE and enter your current password.</p><label className="grid gap-1 text-xs font-semibold text-[var(--ink-soft)]">Confirmation<input required value={deletePhrase} onChange={(event) => setDeletePhrase(event.target.value)} autoComplete="off" className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-sm text-[var(--text)]" placeholder="DELETE" /></label><label className="grid gap-1 text-xs font-semibold text-[var(--ink-soft)]">Current password<input required type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} autoComplete="current-password" className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-sm text-[var(--text)]" /></label>{deleteError && <p role="alert" className="mb-0 text-sm text-[var(--coral)]">{deleteError}</p>}<Button variant="quiet" type="submit" disabled={deleting || deletePhrase !== 'DELETE'} className="justify-self-start !border-[var(--coral)] !bg-[var(--coral)] !text-white">{deleting ? 'Deleting your data…' : 'Permanently delete account'}</Button></form>}
          </div>
        </div>
      </section>
      <div className="settings-bottom"><span>Growth happens at your pace.</span><Button variant="quiet" onClick={() => logout.mutate()} disabled={logout.isPending}><LogOut size={17} /> Sign out</Button></div>
    </main>
  );
}
