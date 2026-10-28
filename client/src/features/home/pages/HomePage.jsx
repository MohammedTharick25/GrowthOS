import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Compass, Heart, Leaf, Sparkles, Wallet, Users, BookOpen, Plus } from 'lucide-react';
import { useSession } from '../../auth/hooks.js';
import { usePracticeData, useToggleHabit, useTogglePriority } from '../../practice/hooks.js';
import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { QuickActions } from '../../practice/QuickActions.jsx';
import GrowthProgress from '../../gamification/GrowthProgress.jsx';
import { dateKeyAt, shiftDateKey } from '../../../lib/date.js';
import { getOfflineCheckins, removeOfflineCheckin } from '../../../lib/offlineCheckins.js';
import { practiceApi } from '../../practice/api.js';
import { queryKeys } from '../../../lib/queryKeys.js';

const icons = { career: Compass, health: Heart, confidence: Sparkles, finance: Wallet, family: Users, discipline: Leaf };
const priorityCopy = { career: 'What skill or project will I work on?', health: 'What will I do to care for my body?', confidence: 'What action will help me practise self-respect?' };

export default function HomePage() {
  const { data: user } = useSession();
  const { plan, habits, checkins, identities } = usePracticeData();
  const togglePriority = useTogglePriority();
  const toggleHabit = useToggleHabit(user);
  const [practiceFeedback, setPracticeFeedback] = useState('');
  const [offlineCheckins, setOfflineCheckins] = useState([]);
  const [offlineSyncMessage, setOfflineSyncMessage] = useState('');
  const queryClient = useQueryClient();
  const syncingOffline = useRef(false);
  const currentPlan = plan.data;
  const completedPriorities = currentPlan?.priorities?.filter((priority) => priority.done).length || 0;
  const completedHabits = checkins.data?.length || 0;
  const earnedMilestone = togglePriority.data?.badgesAwarded?.at(-1) || toggleHabit.data?.badgesAwarded?.at(-1);
  const now = new Date();
  const timezone = user?.timezone || 'Asia/Kolkata';
  const dateKey = dateKeyAt(now, timezone);
  const date = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${dateKey}T12:00:00Z`));
  const hour = Number(new Intl.DateTimeFormat('en', { hour: 'numeric', hourCycle: 'h23', timeZone: timezone }).format(now));
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const nextPriority = currentPlan?.priorities?.find((priority) => !priority.done);
  const focusIdentityKey = user?.activeIdentityIds?.find((key) => identities.data?.some((identity) => identity.key === key)) || nextPriority?.identityKey || habits.data?.[0]?.identityKey;
  const focusIdentity = identities.data?.find((identity) => identity.key === focusIdentityKey);

  useEffect(() => {
    if (!user?.id) return undefined;
    let mounted = true;
    const syncQueued = async () => {
      if (syncingOffline.current) return;
      syncingOffline.current = true;
      try {
        const queue = await getOfflineCheckins(String(user.id));
        if (!mounted) return;
        setOfflineCheckins(queue);
        if (!navigator.onLine) return;
        const todayKey = dateKeyAt(new Date(), timezone);
        const oldestValid = shiftDateKey(todayKey, -1);
        let synced = 0;
        for (const entry of queue) {
          if (entry.dateKey < oldestValid || !navigator.onLine) continue;
          await practiceApi.setHabitCheckin(entry);
          await removeOfflineCheckin(entry.key);
          synced += 1;
        }
        const remaining = await getOfflineCheckins(String(user.id));
        if (!mounted) return;
        setOfflineCheckins(remaining);
        if (synced) {
          setOfflineSyncMessage(`${synced} offline ${synced === 1 ? 'check-in has' : 'check-ins have'} synced.`);
          queryClient.invalidateQueries({ queryKey: queryKeys.todayCheckins });
          queryClient.invalidateQueries({ queryKey: queryKeys.streak });
          queryClient.invalidateQueries({ queryKey: queryKeys.gamification });
          queryClient.invalidateQueries({ queryKey: queryKeys.badges });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      } catch {
        if (mounted) setOfflineSyncMessage('Some check-ins are still waiting to sync. We’ll try again when you reconnect.');
      } finally { syncingOffline.current = false; }
    };
    window.addEventListener('online', syncQueued);
    window.addEventListener('growthos:sync-checkins', syncQueued);
    syncQueued();
    return () => { mounted = false; window.removeEventListener('online', syncQueued); window.removeEventListener('growthos:sync-checkins', syncQueued); };
  }, [user?.id, timezone, queryClient]);

  return (
    <main className="home-page">
      <div className="home-topline"><span>{date}</span><span className="today-status"><span /> YOUR SPACE TO GROW</span></div>
      <section className="greeting-row !items-stretch !gap-6">
        <div className="min-w-0 flex-1"><span className="section-kicker">A NEW DAY, A SMALL BEGINNING</span><h1>{greeting}, {user?.name?.split(' ')[0] || 'friend'}<span className="greeting-period">.</span></h1><p>You don’t have to do it all. Just choose what matters today.</p></div>
        <div className="w-full max-w-[22.5rem] shrink-0 min-[761px]:w-[42%] min-[761px]:max-w-[22.5rem]"><GrowthProgress habits={habits.data || []} /></div>
      </section>
      {offlineCheckins.length > 0 && <Card className="mb-5 flex items-start gap-3 border-[var(--line)] bg-[var(--surface-soft)] p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--green-soft)] text-[var(--green)]"><Check size={17}/></span><div className="min-w-0"><strong className="text-sm text-[var(--text)]">{offlineCheckins.length} habit update{offlineCheckins.length === 1 ? '' : 's'} waiting to sync</strong><p className="mb-0 mt-1 text-xs leading-relaxed text-[var(--muted)]">Only your account ID, habit IDs, dates, and completion states are kept here until they sync.</p>{offlineCheckins.some((entry) => entry.dateKey < shiftDateKey(dateKey, -1)) && <><p className="mb-0 mt-2 text-xs text-[var(--coral)]">Some are older than yesterday and need your review before they can sync.</p><button className="mt-2 text-xs font-semibold text-[var(--coral)] underline" onClick={async () => { const expired = offlineCheckins.filter((entry) => entry.dateKey < shiftDateKey(dateKey, -1)); for (const entry of expired) await removeOfflineCheckin(entry.key); setOfflineCheckins((items) => items.filter((entry) => !expired.some((old) => old.key === entry.key))); setOfflineSyncMessage('Older unsynced check-ins were removed from this device.'); }}>Clear older check-ins</button></>}{offlineSyncMessage && <p className="mb-0 mt-2 text-xs font-semibold text-[var(--green)]" role="status">{offlineSyncMessage}</p>}</div></Card>}
      {offlineSyncMessage && offlineCheckins.length === 0 && <p className="mb-4 text-xs font-semibold text-[var(--green)]" role="status">{offlineSyncMessage}</p>}
      {focusIdentity && <Card className="!my-0 !mb-8 !flex !min-w-0 !flex-col !items-start !gap-4 !border-[var(--line)] !bg-[var(--surface)] !p-5 sm:!flex-row sm:!items-center sm:!p-6" aria-label="Your identity for today">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--green-soft)] text-[var(--green)]"><Sparkles size={19} /></span>
        <div className="min-w-0 flex-1"><span className="section-kicker">WHO YOU’RE BECOMING</span><h2 className="mb-1 mt-1 font-[Manrope] text-lg font-semibold tracking-tight text-[var(--text)]">{focusIdentity.name}</h2><p className="mb-1 text-base leading-relaxed text-[var(--green)]">“{focusIdentity.statement}”</p><small className="text-xs leading-relaxed text-[var(--muted)]">Today’s small actions are proof of this growth. You only need one next step.</small></div>
        <Link to="/app/identities" className="inline-flex shrink-0 items-center gap-1 self-start text-xs font-semibold text-[var(--green)] hover:underline sm:self-center">Keep this in view <ArrowRight size={15}/></Link>
      </Card>}
      <section className="today-title-row"><div><span className="section-kicker">YOUR DAILY PRACTICE</span><h2>Three ways to show up</h2></div><span className="day-pill"><Check size={13} /> {completedPriorities}/3 DONE</span></section>
      {!plan.isLoading && <Card className="my-4 flex flex-col gap-4 border-[var(--line)] bg-[var(--surface-soft)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--green-soft)] text-[var(--green)]"><Sparkles size={18}/></span><div className="min-w-0"><span className="section-kicker">{nextPriority ? 'START WITH THIS' : completedPriorities ? 'YOU SHOWED UP TODAY' : 'YOUR FIRST SMALL STEP'}</span><p className="mb-0 mt-1 truncate text-sm font-semibold text-[var(--text)]">{nextPriority?.text || (completedPriorities ? 'Your planned actions are complete. Take a moment to reflect.' : 'Choose one action that feels doable today.')}</p></div></div>
        <Link className="shrink-0" to={completedPriorities && !nextPriority ? '/app/review' : '/app/plan'}><Button variant="quiet">{completedPriorities && !nextPriority ? 'Reflect' : 'Shape your day'} <ArrowRight size={15}/></Button></Link>
      </Card>}
      {!plan.isLoading && !plan.isError && !currentPlan?.morningDoneAt && <Card className="plan-prompt"><span className="prompt-icon"><Compass size={18} /></span><div><strong>Take a moment to shape today.</strong><small>Choose three realistic priorities. Keep them small enough to begin.</small></div><Link to="/app/plan"><Button variant="quiet">Plan today <ArrowRight size={16} /></Button></Link></Card>}
      <div className="priority-list">
        {(currentPlan?.priorities || []).map((priority, index) => {
          const Icon = icons[priority.identityKey] || Sparkles;
          const identity = identities.data?.find((item) => item.key === priority.identityKey);
          return <Card className={`priority-card priority-${identity?.color || 'green'} ${priority.done ? 'is-complete' : ''}`} key={`${priority.identityKey}-${index}`}>
            <button className="priority-check" aria-label={`${priority.done ? 'Mark' : 'Complete'} priority ${index + 1}`} aria-pressed={priority.done} disabled={togglePriority.isPending} onClick={() => togglePriority.mutate(index, { onSuccess: () => setPracticeFeedback(priority.done ? 'Priority returned to your list.' : 'Priority complete. That action is evidence of your growth.') })}><Check size={15} /></button>
            <span className="priority-index">0{index + 1}</span><span className="priority-icon"><Icon size={20} /></span>
            <div className="priority-copy"><h3>{identity?.name || priority.identityKey}</h3><p>{priority.text || priorityCopy[priority.identityKey] || 'Choose one small action for this area.'}</p></div>
            <span className="priority-time"><Clock3 size={14} /> {priority.done ? 'Done for today' : 'Your pace'}</span>
          </Card>;
        })}
        {plan.isLoading && <div className="practice-loading" aria-label="Loading your priorities" />}
        {plan.isError && <div className="rounded-2xl border border-[var(--coral)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--coral)]" role="alert">Your plan didn’t load. <button className="font-semibold underline" onClick={() => plan.refetch()}>Try again</button></div>}
      </div>
      {(practiceFeedback || togglePriority.isError || toggleHabit.isError) && <p role={togglePriority.isError || toggleHabit.isError ? 'alert' : 'status'} aria-live="polite" className={`my-3 text-sm ${togglePriority.isError || toggleHabit.isError ? 'text-[var(--coral)]' : 'text-[var(--green)]'}`}>{togglePriority.isError || toggleHabit.isError ? 'That update didn’t save. Please try again.' : practiceFeedback}</p>}
      <section className="practice-section" id="practice">
        {earnedMilestone && <div className="milestone-toast" role="status"><span className="milestone-particles" aria-hidden="true">{[0,1,2,3,4,5].map((particle)=><i key={particle}>✦</i>)}</span><Sparkles size={16} /><span><strong>A milestone to remember</strong><small>{earnedMilestone.name}</small></span></div>}
        <div className="section-heading compact"><div><span className="section-kicker">SMALL ACTIONS, REAL EVIDENCE</span><h2>Habits to practise</h2></div><span className="completion-count">{completedHabits} completed</span></div>
        <div className="habit-list">
          {(habits.data || []).map((habit) => {
            const done = checkins.data?.some((item) => String(item.habitId?._id || item.habitId) === String(habit._id));
            const Icon = icons[habit.identityKey] || Leaf;
            return <button className={`habit-row ${done ? 'checked' : ''}`} key={habit._id} onClick={() => toggleHabit.mutate({ habitId: habit._id, completed: !done, dateKey }, { onSuccess: async (result) => { if (result.offlineQueued) { setPracticeFeedback('Check-in saved on this device. It will sync when you reconnect.'); setOfflineCheckins(await getOfflineCheckins(String(user.id))); } else setPracticeFeedback(done ? 'Habit unchecked. You can return to it later.' : 'Habit checked in. Small actions add up.'); } })} aria-pressed={done} disabled={toggleHabit.isPending}>
              <span className="habit-check"><Check size={15} /></span><span className="habit-symbol"><Icon size={17} /></span><span className="habit-copy"><strong>{habit.title}</strong><small>{habit.description}</small></span>{habit.targetMinutes && <span className="habit-duration"><Clock3 size={13} />{habit.targetMinutes}m</span>}
            </button>;
          })}
          {habits.data?.length === 0 && <Card className="grid gap-2 border-dashed p-5"><strong className="text-sm text-[var(--text)]">Your practice is ready for its first habit.</strong><p className="m-0 text-xs leading-relaxed text-[var(--muted)]">Pick one small action connected to the person you want to become. You can keep it simple and change it anytime.</p><Link to="/app/habits" className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-[var(--green)]">Create a gentle first habit <ArrowRight size={14}/></Link></Card>}
          {habits.isError && <p className="form-error" role="alert">Your habits didn’t load. Refresh this page to try again.</p>}
        </div>
        <div className="practice-links"><Link to="/app/habits"><Plus size={15} /> Manage habits</Link><Link to="/app/identities">Explore your identities <ArrowRight size={15} /></Link></div>
      </section>
      <section className="home-actions">
        <Card className="plan-card"><span className="plan-mark"><Leaf size={19} /></span><div className="plan-copy"><span className="section-kicker">A GENTLE REMINDER</span><h3>Make it small enough to start.</h3><p>If today feels full, choose the tiniest useful version. Ten minutes of learning still counts.</p></div></Card>
        <Card className="review-card"><BookOpen size={19} /><span className="section-kicker">WHEN YOU’RE READY</span><h3>Notice what today taught you.</h3><p>A short reflection helps you carry the useful parts forward.</p><Link to="/app/review"><Button>Evening review <ArrowRight size={16} /></Button></Link></Card>
      </section>
      <QuickActions />
      <div className="home-footer-line">Your actions are the evidence <span>·</span> Keep showing up, gently</div>
    </main>
  );
}
