import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Compass, Heart, Leaf, Sparkles, Users, Wallet } from 'lucide-react';
import { api } from '../lib/axios.js';
import { queryKeys } from '../lib/queryKeys.js';
import { setSession } from '../store/slices/sessionSlice.js';
import { GrowthMark } from '../components/ui/GrowthMark.jsx';
import { Button } from '../components/ui/Button.jsx';

const areas = [
  { id: 'career', title: 'Career & skills', note: 'Learn, practise, and make things.', icon: Compass },
  { id: 'health', title: 'Health & fitness', note: 'Care for your body and energy.', icon: Heart },
  { id: 'confidence', title: 'Confidence', note: 'Build self-trust one action at a time.', icon: Sparkles },
  { id: 'finance', title: 'Financial growth', note: 'Make thoughtful money choices.', icon: Wallet },
  { id: 'family', title: 'Relationships', note: 'Show care while keeping healthy limits.', icon: Users },
  { id: 'discipline', title: 'Discipline & growth', note: 'Follow through, and restart gently.', icon: Leaf },
];

const starterTemplates = {
  career: 'Practise one useful skill for ten minutes', health: 'Take a short walk or stretch', confidence: 'Write down one values-led action',
  finance: 'Review one recent expense', family: 'Send a thoughtful message', discipline: 'Begin one task before checking your phone',
};

const stages = [
  { title: 'Start with you', detail: 'A little about the person behind the practice.' },
  { title: 'Choose what matters', detail: 'Pick the areas you want to give attention to.' },
  { title: 'Choose small habits', detail: 'Pick up to three actions that feel realistic to repeat.' },
  { title: 'Plan your first day', detail: 'Choose a few clear next steps. You can change them anytime.' },
  { title: 'Set a gentle pace', detail: 'Choose your time zone, daily pace, and optional reminders.' },
];

export default function OnboardingPage() {
  const user = useSelector((state) => state.session.user);
  const initialAreas = user?.activeIdentityIds?.length ? user.activeIdentityIds : ['career', 'health', 'confidence'];
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [activeIdentityIds, setActiveIdentityIds] = useState(initialAreas);
  const [starterIdentityIds, setStarterIdentityIds] = useState(initialAreas.slice(0, 3));
  const [starterTitles, setStarterTitles] = useState(starterTemplates);
  const [priorities, setPriorities] = useState(initialAreas.slice(0, 3).map((identityKey) => ({ identityKey, text: '' })));
  const [dailyTimeMinutes, setDailyTimeMinutes] = useState(user?.dailyTimeMinutes || 60);
  const [timezone, setTimezone] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata');
  const [reminderTimes, setReminderTimes] = useState({ morning: '', evening: '', weekly: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const complete = useMutation({
    mutationFn: async () => (await api.post('/user/v1/complete-onboarding', {
      name: name.trim() || undefined,
      activeIdentityIds,
      dailyTimeMinutes,
      timezone,
      reminderTimes,
      starterHabits: starterIdentityIds.map((identityKey) => ({ identityKey, title: starterTitles[identityKey].trim(), description: 'A small practice, at your pace.', schedule: 'daily' })),
      priorities: priorities.filter((item) => item.text.trim()).map((item) => ({ identityKey: item.identityKey, text: item.text.trim() })),
    })).data.data.user,
    onSuccess: (nextUser) => {
      queryClient.setQueryData(queryKeys.auth, nextUser);
      dispatch(setSession(nextUser));
      navigate('/app', { replace: true });
    },
    onError: (mutationError) => setError(mutationError.response?.data?.error?.message || 'We couldn’t save your choices. Please try again.'),
  });

  const toggleArea = (id) => {
    const nextAreas = activeIdentityIds.includes(id) ? activeIdentityIds.filter((area) => area !== id) : [...activeIdentityIds, id];
    setActiveIdentityIds(nextAreas);
    setStarterIdentityIds((current) => {
      const selected = current.filter((area) => nextAreas.includes(area));
      if (nextAreas.includes(id) && !activeIdentityIds.includes(id) && selected.length < 3) selected.push(id);
      return selected;
    });
    setPriorities((current) => {
      const next = current.filter((item) => nextAreas.includes(item.identityKey)).slice(0, 3);
      for (const identityKey of nextAreas) {
        if (next.length === 3) break;
        if (!next.some((item) => item.identityKey === identityKey)) next.push({ identityKey, text: '' });
      }
      return next;
    });
  };

  const next = () => {
    setError('');
    if (step === 1 && activeIdentityIds.length === 0) {
      setError('Choose at least one area to get started.');
      return;
    }
    if (step === 2 && starterIdentityIds.length === 0) { setError('Choose at least one starter habit.'); return; }
    if (step === 2 && starterIdentityIds.some((id) => !starterTitles[id]?.trim())) { setError('Give each starter habit a short name.'); return; }
    if (step === 3 && !priorities.some((item) => item.text.trim())) { setError('Add at least one small action for your first day.'); return; }
    setStep((current) => Math.min(current + 1, stages.length - 1));
  };

  const finish = (event) => {
    event.preventDefault();
    setError('');
    complete.mutate();
  };

  const stage = stages[step];
  return (
    <main className="grid min-h-[100dvh] place-items-start bg-[var(--bg)] px-4 py-4 text-[var(--text)] sm:place-items-center sm:px-6 sm:py-8">
      <section className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:max-h-[calc(100dvh-4rem)] sm:p-9">
        <header className="mb-8 flex items-center justify-between gap-4">
          <a href="/" className="brand"><GrowthMark /> growth<span>OS</span></a>
          <span className="text-xs font-semibold text-[var(--muted)]">Step {step + 1} of {stages.length}</span>
        </header>

        <div className="mb-8 flex gap-2" aria-label={`Step ${step + 1} of ${stages.length}`}>
          {stages.map((item, index) => <span key={item.title} className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-[var(--green)]' : 'bg-[var(--line)]'}`} />)}
        </div>

        <div className="mb-7">
          <span className="section-kicker">YOUR FIRST STEPS</span>
          <h1 id="onboarding-step-title" aria-live="polite" className="mb-2 mt-2 font-[Manrope] text-3xl font-semibold tracking-tight sm:text-4xl">{stage.title}</h1>
          <p className="m-0 text-sm leading-relaxed text-[var(--muted)]">{stage.detail}</p>
        </div>

        <form onSubmit={finish}>
          {step === 0 && <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]" htmlFor="onboarding-name">What should we call you?</label>
            <input id="onboarding-name" autoComplete="name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 text-base text-[var(--text)] outline-none transition focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)]" />
            <p className="m-0 text-xs text-[var(--muted)]">You can change this later in your account settings.</p>
          </div>}

          {step === 1 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {areas.map(({ id, title, note, icon: Icon }) => {
              const selected = activeIdentityIds.includes(id);
              return <button type="button" key={id} aria-pressed={selected} onClick={() => toggleArea(id)} className={`flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-left transition ${selected ? 'border-[var(--green)] bg-[var(--green-soft)]' : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--green)]'}`}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--green)]"><Icon size={19} /></span>
                <span className="min-w-0 flex-1"><strong className="block text-sm font-semibold text-[var(--text)]">{title}</strong><small className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">{note}</small></span>
                <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${selected ? 'border-[var(--green)] bg-[var(--green)] text-[var(--bg)]' : 'border-[var(--line-strong)] text-transparent'}`}><Check size={12} /></span>
              </button>;
            })}
          </div>}

          {step === 2 && <div className="grid gap-3">
            <p className="m-0 text-sm text-[var(--muted)]">Choose up to three. You can keep or edit these later.</p>
            {activeIdentityIds.map((id) => {
              const area = areas.find((item) => item.id === id);
              const selected = starterIdentityIds.includes(id);
              return <div key={id} className={`grid gap-3 rounded-2xl border p-4 sm:grid-cols-[auto_1fr] sm:items-center ${selected ? 'border-[var(--green)] bg-[var(--green-soft)]' : 'border-[var(--line)] bg-[var(--surface)]'}`}>
                <button type="button" aria-pressed={selected} onClick={() => setStarterIdentityIds((current) => selected ? current.filter((key) => key !== id) : current.length < 3 ? [...current, id] : [...current.slice(1), id])} className="flex min-h-11 items-center gap-3 text-left text-sm font-semibold text-[var(--text)]"><span className="grid size-9 place-items-center rounded-xl bg-[var(--surface)] text-[var(--green)]"><area.icon size={18}/></span><span>{area.title}</span><span className="text-xs text-[var(--muted)]">{selected ? 'Selected' : starterIdentityIds.length === 3 ? 'Replace oldest selection' : 'Optional'}</span></button>
                {selected && <label className="grid gap-1 text-xs font-semibold text-[var(--ink-soft)] sm:col-start-2">A small habit<input required maxLength={120} value={starterTitles[id]} onChange={(event) => setStarterTitles((current) => ({ ...current, [id]: event.target.value }))} className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-normal text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)]" /></label>}
              </div>;
            })}
          </div>}

          {step === 3 && <div className="grid gap-3">
            {priorities.map((item, index) => <label key={item.identityKey} className="grid gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-sm font-semibold text-[var(--ink-soft)]"><span>{String(index + 1).padStart(2, '0')} · {areas.find((area) => area.id === item.identityKey)?.title}</span><input maxLength={240} value={item.text} onChange={(event) => setPriorities((current) => current.map((priority) => priority.identityKey === item.identityKey ? { ...priority, text: event.target.value } : priority))} placeholder="One clear action you can begin today" className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-normal text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)]" /></label>)}
            <p className="m-0 text-xs text-[var(--muted)]">At least one action is enough to get started. The rest can wait.</p>
          </div>}

          {step === 4 && <div className="grid gap-5">
            <div className="rounded-2xl bg-[var(--surface-soft)] p-5 sm:p-7">
            <div className="flex items-end justify-between gap-4">
              <div><span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">DAILY TIME</span><p className="mb-0 mt-2 text-sm text-[var(--muted)]">There’s no perfect number. Pick what you can return to.</p></div>
              <strong className="shrink-0 font-[Manrope] text-3xl font-semibold text-[var(--green)]">{dailyTimeMinutes}<span className="ml-1 text-sm font-medium">min</span></strong>
            </div>
            <input aria-label="Daily time in minutes" type="range" min="30" max="240" step="15" value={dailyTimeMinutes} onChange={(event) => setDailyTimeMinutes(Number(event.target.value))} className="mt-7 w-full accent-[var(--green)]" />
            <div className="flex justify-between text-xs text-[var(--muted)]"><span>30 minutes</span><span>4 hours</span></div>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"><Sparkles className="mt-0.5 shrink-0 text-[var(--green)]" size={17} /><p className="m-0 text-sm leading-relaxed text-[var(--ink-soft)]">Your first focus areas: {activeIdentityIds.map((id) => areas.find((area) => area.id === id)?.title).filter(Boolean).join(', ')}.</p></div>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">Your time zone<select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)]">{[...new Set([timezone, 'Asia/Kolkata', 'Asia/Singapore', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'])].map((zone) => <option key={zone} value={zone}>{zone.replaceAll('_', ' ')}</option>)}</select></label>
            <div className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 sm:p-5"><div><strong className="text-sm text-[var(--text)]">Gentle reminders</strong><p className="mb-0 mt-1 text-xs leading-relaxed text-[var(--muted)]">Optional emails, sent in this time zone. Leave a time blank to keep it off.</p></div>{[['morning','Morning plan'],['evening','Evening reflection'],['weekly','Weekly check-in']].map(([key,label]) => <label key={key} className="flex items-center justify-between gap-4 text-sm text-[var(--ink-soft)]">{label}<input type="time" value={reminderTimes[key]} onChange={(event) => setReminderTimes((current) => ({ ...current, [key]: event.target.value }))} className="min-h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]" /></label>)}</div>
          </div>}

          {error && <p role="alert" className="mt-4 rounded-xl bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--coral)]">{error}</p>}

          <footer className="sticky bottom-0 z-10 -mx-5 mt-8 flex items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--surface)] px-5 pb-2 pt-5 sm:-mx-9 sm:px-9">
            <Button type="button" variant="quiet" disabled={step === 0 || complete.isPending} onClick={() => { setError(''); setStep((current) => Math.max(current - 1, 0)); }}>
              {step > 0 && <><ArrowLeft size={16} /> Back</>}
            </Button>
            {step < stages.length - 1
              ? <Button type="button" onClick={next}>Continue <ArrowRight size={16} /></Button>
              : <Button type="submit" disabled={complete.isPending}>{complete.isPending ? 'Saving your setup…' : <>Start my practice <ArrowRight size={16} /></>}</Button>}
          </footer>
        </form>
      </section>
    </main>
  );
}
