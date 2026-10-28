import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { practiceApi } from './api.js';
import { queryKeys } from '../../lib/queryKeys.js';
import { queueOfflineCheckin } from '../../lib/offlineCheckins.js';

export function usePracticeData() {
  const plan = useQuery({ queryKey: queryKeys.todayPlan, queryFn: practiceApi.plan });
  const habits = useQuery({ queryKey: queryKeys.habits, queryFn: practiceApi.habits });
  const checkins = useQuery({ queryKey: queryKeys.todayCheckins, queryFn: practiceApi.checkins });
  const identities = useQuery({ queryKey: queryKeys.identities, queryFn: practiceApi.identities, staleTime: 60 * 60 * 1000 });
  return { plan, habits, checkins, identities };
}

export function useSavePlan() {
  const client = useQueryClient();
  return useMutation({ mutationFn: practiceApi.savePlan, onSuccess: (plan) => { client.setQueryData(queryKeys.todayPlan, plan); client.invalidateQueries({ queryKey: queryKeys.streak }); client.invalidateQueries({ queryKey: queryKeys.gamification }); client.invalidateQueries({ queryKey: queryKeys.badges }); client.invalidateQueries({ queryKey: ['analytics'] }); } });
}

export function useTogglePriority() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: practiceApi.togglePriority,
    onSuccess: (result) => client.setQueryData(queryKeys.todayPlan, result.plan),
    onMutate: async (index) => {
      await client.cancelQueries({ queryKey: queryKeys.todayPlan });
      const previous = client.getQueryData(queryKeys.todayPlan);
      client.setQueryData(queryKeys.todayPlan, (plan) => plan && ({ ...plan, priorities: plan.priorities.map((row, i) => i === index ? { ...row, done: !row.done } : row) }));
      return { previous };
    },
    onError: (_error, _index, context) => client.setQueryData(queryKeys.todayPlan, context?.previous),
    onSettled: () => { client.invalidateQueries({ queryKey: queryKeys.todayPlan }); client.invalidateQueries({ queryKey: queryKeys.streak }); client.invalidateQueries({ queryKey: queryKeys.gamification }); client.invalidateQueries({ queryKey: queryKeys.badges }); client.invalidateQueries({ queryKey: ['analytics'] }); },
  });
}

export function useToggleHabit(user) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ habitId, completed, dateKey }) => {
      const entry = { userId: String(user?.id || ''), habitId: String(habitId), dateKey, completed };
      const queue = async () => { if (!entry.userId) throw new Error('Sign in again to save this check-in.'); await queueOfflineCheckin(entry); return { offlineQueued: true, completed }; };
      if (!navigator.onLine) return queue();
      try { return await practiceApi.setHabitCheckin(entry); }
      catch (error) { if (!error.response) { const saved = await queue(); if (navigator.onLine) window.dispatchEvent(new Event('growthos:sync-checkins')); return saved; } throw error; }
    },
    onMutate: async (habitId) => {
      await client.cancelQueries({ queryKey: queryKeys.todayCheckins });
      const previous = client.getQueryData(queryKeys.todayCheckins) || [];
      const hasCheckin = (item) => String(item.habitId?._id || item.habitId) === String(habitId.habitId);
      client.setQueryData(queryKeys.todayCheckins, habitId.completed ? (previous.some(hasCheckin) ? previous : [...previous, { habitId: habitId.habitId, optimistic: true }]) : previous.filter((item) => !hasCheckin(item)));
      return { previous };
    },
    onError: (_error, _variables, context) => client.setQueryData(queryKeys.todayCheckins, context?.previous),
    onSuccess: (result) => {
      if (result.offlineQueued) return;
      client.invalidateQueries({ queryKey: queryKeys.todayCheckins }); client.invalidateQueries({ queryKey: queryKeys.streak }); client.invalidateQueries({ queryKey: queryKeys.gamification }); client.invalidateQueries({ queryKey: queryKeys.badges }); client.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useSaveReview() {
  const client = useQueryClient();
  return useMutation({ mutationFn: practiceApi.saveReview, onSuccess: () => { client.invalidateQueries({ queryKey: queryKeys.gamification }); client.invalidateQueries({ queryKey: queryKeys.badges }); client.invalidateQueries({ queryKey: ['analytics'] }); client.invalidateQueries({ queryKey: ['journal'] }); } });
}

export function useAddHabit() {
  const client = useQueryClient();
  return useMutation({ mutationFn: practiceApi.addHabit, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.habits }) });
}

export function useArchiveHabit() {
  const client = useQueryClient();
  return useMutation({ mutationFn: practiceApi.archiveHabit, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.habits }) });
}
