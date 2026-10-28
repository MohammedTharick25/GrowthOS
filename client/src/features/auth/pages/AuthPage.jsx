import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { api } from '../../../lib/axios.js';
import { setSession } from '../../../store/slices/sessionSlice.js';
import { Button } from '../../../components/ui/Button.jsx';
import { GrowthMark } from '../../../components/ui/GrowthMark.jsx';

const validateForm = (form, isSignup) => {
  const errors = {};
  if (isSignup && !form.name.trim()) errors.name = 'Enter your name.';
  if (isSignup && form.name.trim().length > 80) errors.name = 'Your name must be 80 characters or fewer.';
  if (!form.email.trim()) errors.email = 'Enter your email address.';
  else if (form.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.password) errors.password = 'Enter your password.';
  else if (isSignup && form.password.length < 8) errors.password = 'Use at least 8 characters.';
  else if (form.password.length > 128) errors.password = 'Your password must be 128 characters or fewer.';
  return errors;
};

function responseFieldErrors(error) {
  const fields = error.response?.data?.error?.fields;
  return Array.isArray(fields) ? Object.fromEntries(fields.map(({ field, message }) => [field, message])) : {};
}

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  };

  async function submit(event) {
    event.preventDefault();
    setError('');
    const validationErrors = validateForm(form, isSignup);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      document.getElementById(Object.keys(validationErrors)[0])?.focus();
      return;
    }

    setBusy(true);
    try {
      const payload = isSignup
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };
      const { data } = await api.post(`/auth/v1/${isSignup ? 'signup' : 'login'}`, payload);
      if (isSignup) {
        navigate(`/verify-email?email=${encodeURIComponent(data.data.email)}`, {
          state: { email: data.data.email, developmentVerificationUrl: data.data.developmentVerificationUrl },
        });
        return;
      }
      dispatch(setSession(data.data.user));
      navigate(data.data.user.onboardingDone ? '/app' : '/onboarding');
    } catch (requestError) {
      const serverFields = responseFieldErrors(requestError);
      if (Object.keys(serverFields).length) setFieldErrors(serverFields);
      else setError(requestError.response?.data?.error?.message || 'We couldn’t connect. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  const field = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: change,
    'aria-invalid': Boolean(fieldErrors[name]),
    'aria-describedby': fieldErrors[name] ? `${name}-error` : undefined,
  });

  return <main className="auth-page">
    <div className="auth-side">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to GrowthOS</Link>
      <div className="auth-quote"><Sparkles size={22} /><h1>Small steps are<br />still <em>steps.</em></h1><p>You don’t have to have it all figured out to begin.</p><div className="auth-decoration"><span>✳</span><span>◌</span><span>✦</span></div></div>
      <span className="auth-side-foot">A daily practice for becoming.</span>
    </div>
    <div className="auth-form-side">
      <div className="auth-form-wrap">
        <Link to="/" className="brand auth-mobile-brand"><GrowthMark /> growth<span>OS</span></Link>
        <span className="eyebrow">{isSignup ? 'YOUR NEXT CHAPTER' : 'WELCOME BACK'}</span>
        <h2>{isSignup ? 'Begin with today.' : 'Good to see you.'}</h2>
        <p className="form-lead">{isSignup ? 'A thoughtful practice starts with one small step.' : 'Pick up your practice right where you left it.'}</p>
        {location.state?.sessionExpired && <p className="form-error" role="alert">Your session expired. Sign in again to keep going.</p>}
        <form onSubmit={submit} noValidate>
          {isSignup && <label htmlFor="name">Your name<input {...field('name')} autoComplete="name" maxLength={80} placeholder="What should we call you?" />{fieldErrors.name && <span className="field-error" id="name-error">{fieldErrors.name}</span>}</label>}
          <label htmlFor="email">Email address<input {...field('email')} type="email" autoComplete="email" maxLength={254} inputMode="email" placeholder="you@example.com" />{fieldErrors.email && <span className="field-error" id="email-error">{fieldErrors.email}</span>}</label>
          <label htmlFor="password">Password<input {...field('password')} type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} maxLength={128} placeholder={isSignup ? 'At least 8 characters' : 'Your password'} />{fieldErrors.password && <span className="field-error" id="password-error">{fieldErrors.password}</span>}</label>
          {error && <p className="form-error" role="alert">{error} {error.toLowerCase().includes('verify') && <Link to={`/verify-email?email=${encodeURIComponent(form.email.trim())}`} className="font-semibold underline">Resend verification link</Link>}</p>}
          {!isSignup && <p className="-mt-2 text-right text-xs"><Link className="font-semibold text-[var(--green)]" to="/forgot-password">Forgot password?</Link></p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? 'One moment…' : isSignup ? 'Create your account' : 'Log in'}</Button>
        </form>
        <p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to GrowthOS?'} <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create an account'}</Link></p>
        <p className="auth-footnote">Your progress is personal. Take it at your pace.</p>
      </div>
    </div>
  </main>;
}
