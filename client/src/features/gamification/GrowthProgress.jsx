import { useState } from 'react';
import { Award, Flame, Sparkles } from 'lucide-react';
import { useBadges, useGamification, useRecoveryDay, useStreak } from './hooks.js';

export default function GrowthProgress({ habits = [] }) {
  const streakQuery = useStreak(); const xpQuery = useGamification(); const badgesQuery = useBadges(); const recovery = useRecoveryDay();
  const [celebrated, setCelebrated] = useState('');
  const streak = streakQuery.data; const xp = xpQuery.data; const recentBadge = streak?.badgesAwarded?.[0];
  const unlocked = (badgesQuery.data || []).filter((badge) => badge.earned).slice(0, 3);
  const canRecover = streak?.current > 0 && streak?.recoveryTokensAvailable > 0 && streak?.todayStatus === 'pending';
  const recentRecovery = streak?.history?.slice(-3).some((day) => day.status === 'recovery');
  if (streakQuery.isLoading && xpQuery.isLoading) return <section className="growth-progress-card" aria-label="Loading your progress"><div className="growth-progress-skeleton" /></section>;
  return <section className="growth-progress-card" aria-label="Your growth progress">
    <div className="growth-streak"><span className="growth-flame"><Flame size={22} fill="currentColor" /></span><div><strong>{streak?.current || 0} day rhythm</strong><small>Best: {streak?.best || 0} days</small></div><span className="growth-xp-total"><Sparkles size={14} /> {xp?.xp || 0} XP</span></div>
    <div className="growth-level-row"><span>{xp?.level || 'Beginner'}</span><span>{xp?.nextLevel ? `${xp.nextLevel} · ${xp.progress || 0}%` : 'Anchor level'}</span></div>
    <div className="growth-level-track" role="progressbar" aria-label="Progress to next level" aria-valuenow={xp?.progress || 0} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${xp?.progress || 0}%` }} /></div>
    <div className="recovery-row"><span><strong>{streak?.recoveryTokensAvailable || 0}</strong> recovery {streak?.recoveryTokensAvailable === 1 ? 'day' : 'days'} left this week</span>{canRecover && <button onClick={() => recovery.mutate(undefined, { onSuccess: () => setCelebrated('A recovery day is here when you need it.') })} disabled={recovery.isPending}>{recovery.isPending ? 'Saving…' : 'Use recovery day'}</button>}</div>
    {recentRecovery && <p className="growth-kind-note">A recovery day helped keep your rhythm. Rest is part of practice.</p>}
    {streak?.current === 0 && streak?.lastActiveDateKey && <p className="growth-kind-note">Welcome back. Adjust your plan and begin again when you’re ready.</p>}
    {recovery.isError && <p className="growth-error" role="alert">{recovery.error?.response?.data?.error?.message || 'We couldn’t use that recovery day right now.'}</p>}
    {streak?.habitStreaks?.some((item) => item.current > 0) && <div className="habit-rhythms"><span>HABIT RHYTHMS</span>{streak.habitStreaks.filter((item) => item.current > 0).slice(0, 3).map((item) => <small key={item.habitId} title={habits.find((habit) => String(habit._id) === item.habitId)?.title || 'Habit'}>🔥 {habits.find((habit) => String(habit._id) === item.habitId)?.title || 'Habit'} · {item.current}d</small>)}</div>}
    {recentBadge && recentBadge.name !== celebrated && <div className="milestone-toast" role="status"><span className="milestone-particles" aria-hidden="true">{[0,1,2,3,4,5].map((particle)=><i key={particle}>✦</i>)}</span><Award size={16} /><span><strong>New milestone</strong><small>{recentBadge.name}</small></span></div>}
    {celebrated && !recentBadge && <p className="growth-kind-note" role="status">{celebrated}</p>}
    {unlocked.length > 0 && <div className="earned-badges" aria-label="Recent badges">{unlocked.map((badge) => <span key={badge.key} title={badge.description}><Award size={13} /> {badge.name}</span>)}</div>}
  </section>;
}
