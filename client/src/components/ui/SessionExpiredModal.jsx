import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Clock3, LoaderCircle, ShieldCheck } from 'lucide-react';
import { api, continueSessionRefresh, logoutExpiredSession } from '../../lib/axios.js';

export default function SessionExpiredModal() {
  const { refreshPrompt: open, refreshing, refreshError } = useSelector((state) => state.session);
  const continueButton = useRef(null);
  const dialog = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    continueButton.current?.focus();
    const keepFocusInside = (event) => {
      if (event.key !== 'Tab') return;
      const controls = [...(dialog.current?.querySelectorAll('button:not(:disabled)') || [])];
      if (!controls.length) return;
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keepFocusInside);
    return () => { document.removeEventListener('keydown', keepFocusInside); previousFocus?.focus?.(); };
  }, [open]);

  if (!open) return null;

  async function logOut() {
    try { await api.post('/auth/v1/logout'); } catch { /* local sign-out still completes if offline */ }
    logoutExpiredSession();
  }

  return <div className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm" role="presentation">
    <section ref={dialog} className="relative my-auto w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-float)]" role="dialog" aria-modal="true" aria-labelledby="session-expired-title" aria-describedby="session-expired-description">
      <div className="h-1.5 bg-gradient-to-r from-[var(--green)] to-[var(--lavender)]" />
      <div className="p-6 sm:p-9">
        <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--green-soft)] text-[var(--green)]"><Clock3 size={26} /></div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--green)]">Session security</p>
        <h2 id="session-expired-title" className="font-[Manrope] text-2xl font-semibold tracking-tight sm:text-3xl">Your session needs a refresh</h2>
        <p id="session-expired-description" className="mt-3 text-sm leading-relaxed text-[var(--muted)]">Your sign-in token has expired. Continue to securely refresh it and keep working, or log out of this device.</p>
        {refreshError && <p className="mt-4 rounded-xl border border-[var(--coral)] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--coral)]" role="alert">{refreshError}</p>}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 text-xs leading-relaxed text-[var(--muted)]"><ShieldCheck className="mt-0.5 shrink-0 text-[var(--green)]" size={18} />Your other signed-in devices will remain connected.</div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={logOut} disabled={refreshing} className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--green)] disabled:cursor-not-allowed disabled:opacity-60">Log out</button>
          <button ref={continueButton} type="button" onClick={continueSessionRefresh} disabled={refreshing} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--green)] px-5 text-sm font-semibold text-[var(--bg)] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70">{refreshing && <LoaderCircle size={17} className="animate-spin" />}{refreshing ? 'Refreshing session…' : 'Continue session'}</button>
        </div>
      </div>
    </section>
  </div>;
}
