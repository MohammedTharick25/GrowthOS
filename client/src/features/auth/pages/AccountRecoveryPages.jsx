import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, KeyRound, Mail, Sparkles } from 'lucide-react';
import { api } from '../../../lib/axios.js';
import { Button } from '../../../components/ui/Button.jsx';
import { GrowthMark } from '../../../components/ui/GrowthMark.jsx';

function RecoveryShell({ eyebrow, title, description, children }) {
  return <main className="relative isolate grid min-h-[100dvh] place-items-center overflow-hidden bg-[var(--bg)] px-4 py-8 text-[var(--text)] sm:px-6">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--green-soft),transparent_58%)] opacity-70" />
    <section className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-float)] sm:p-10">
      <Link to="/" className="brand inline-flex items-center gap-2"><GrowthMark /> growth<span>OS</span></Link>
      <div className="mb-6 mt-8 grid size-14 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--green-soft)] text-[var(--green)] shadow-[var(--shadow)]"><Sparkles size={23} /></div>
      <span className="section-kicker">{eyebrow}</span>
      <h1 className="mb-3 mt-2 font-[Manrope] text-3xl font-semibold tracking-tight sm:text-4xl">{title === 'Resend your link.' ? 'Verify your email.' : title}</h1>
      <p className="mb-7 max-w-prose text-sm leading-relaxed text-[var(--muted)] sm:text-base">{description}</p>
      {children}
    </section>
  </main>;
}

function StatusMessage({ children, error = false }) {
  return <p role={error ? 'alert' : 'status'} className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${error ? 'border-[var(--coral)] bg-[var(--surface-soft)] text-[var(--coral)]' : 'border-[var(--line)] bg-[var(--green-soft)] text-[var(--text)]'}`}>{children}</p>;
}

export function VerifyEmailPage() {
  const [search] = useSearchParams();
  const location = useLocation();
  const token = search.get('token') || '';
  const [email, setEmail] = useState(search.get('email') || location.state?.email || '');
  const [developmentUrl, setDevelopmentUrl] = useState(location.state?.developmentVerificationUrl || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (token) {
        await api.post('/auth/v1/verification/confirm', { token });
        setVerified(true);
      } else {
        const { data } = await api.post('/auth/v1/verification/resend', { email });
        setMessage(data.data.message);
        setDevelopmentUrl(data.data.developmentVerificationUrl || '');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'We couldn’t complete that request. Please try again.');
    } finally { setBusy(false); }
  }

  if (verified) return <RecoveryShell eyebrow="EMAIL CONFIRMED" title="You’re verified." description="Your email is confirmed. Sign in to continue setting up your practice.">
    <div className="grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:grid-cols-[auto_1fr] sm:items-center sm:p-5"><CheckCircle2 className="text-[var(--green)]" size={24} /><p className="text-sm text-[var(--muted)]">Your account is ready. Sign in to continue.</p><Link className="button button-primary button-md sm:col-span-2" to="/login">Continue to sign in <ArrowRight size={16} /></Link></div>
  </RecoveryShell>;

  return <RecoveryShell eyebrow={token ? 'CONFIRM YOUR ACCOUNT' : 'CHECK YOUR INBOX'} title={token ? 'Verify your email.' : 'Resend your link.'} description={token ? 'Confirm this address to finish creating your account.' : 'Enter the email you used to sign up. If it needs verification, we’ll send a fresh link.'}>
    {!token && email && <div className="mb-5 flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--green-soft)] text-[var(--green)]"><Mail size={18} /></span><span className="min-w-0"><span className="block text-xs text-[var(--muted)]">Verification email for</span><strong className="block break-all text-sm text-[var(--text)]">{email}</strong></span></div>}
    <form onSubmit={submit} className="grid gap-4">
      {!token && <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 font-normal text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)]" /></label>}
      <Button type="submit" disabled={busy}>{busy ? 'One moment…' : token ? <><Mail size={16} /> Verify email</> : <>Send verification link <ArrowRight size={16} /></>}</Button>
    </form>
    {message && <StatusMessage>{message}</StatusMessage>}
    {developmentUrl && <a className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-sm font-semibold text-[var(--green)] transition hover:border-[var(--green)]" href={developmentUrl}><span>Open the development verification link</span><ArrowRight className="shrink-0" size={16} /></a>}
    {error && <StatusMessage error>{error}</StatusMessage>}
    <p className="mt-6 text-center text-sm text-[var(--muted)]"><Link className="font-semibold text-[var(--green)]" to="/login">Back to sign in</Link></p>
  </RecoveryShell>;
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [developmentUrl, setDevelopmentUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const { data } = await api.post('/auth/v1/password/forgot', { email });
      setMessage(data.data.message);
      setDevelopmentUrl(data.data.developmentResetUrl || '');
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'We couldn’t complete that request. Please try again.');
    } finally { setBusy(false); }
  }
  return <RecoveryShell eyebrow="ACCOUNT RECOVERY" title="Reset your password." description="Enter your account email. If it matches an account, we’ll send a one-time reset link that expires in an hour.">
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 font-normal text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)]" /></label>
      <Button type="submit" disabled={busy}>{busy ? 'Sending…' : <>Send reset link <ArrowRight size={16} /></>}</Button>
    </form>
    {message && <StatusMessage>{message}</StatusMessage>}
    {developmentUrl && <a className="mt-3 block break-all text-sm font-semibold text-[var(--green)] underline" href={developmentUrl}>Open the development reset link</a>}
    {error && <StatusMessage error>{error}</StatusMessage>}
    <p className="mt-6 text-center text-sm text-[var(--muted)]"><Link className="font-semibold text-[var(--green)]" to="/login">Back to sign in</Link></p>
  </RecoveryShell>;
}

export function ResetPasswordPage() {
  const [search] = useSearchParams();
  const token = search.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setMessage('');
    if (!token) { setError('This reset link is missing. Request a new one.'); return; }
    if (password !== confirmPassword) { setError('The passwords don’t match.'); return; }
    setBusy(true);
    try {
      const { data } = await api.post('/auth/v1/password/reset', { token, password });
      setMessage(data.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'We couldn’t reset your password. Request a fresh link.');
    } finally { setBusy(false); }
  }
  return <RecoveryShell eyebrow="CHOOSE A NEW PASSWORD" title="You can start fresh." description="Choose a strong password with at least eight characters. This will sign out your other sessions.">
    {!message && <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">New password<input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 font-normal text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)]" /></label>
      <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">Confirm password<input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 font-normal text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)]" /></label>
      <Button type="submit" disabled={busy}>{busy ? 'Updating…' : <><KeyRound size={16} /> Update password</>}</Button>
    </form>}
    {message && <StatusMessage>{message}</StatusMessage>}
    {error && <StatusMessage error>{error}</StatusMessage>}
    <p className="mt-6 text-center text-sm text-[var(--muted)]"><Link className="font-semibold text-[var(--green)]" to="/login">Back to sign in</Link></p>
  </RecoveryShell>;
}
