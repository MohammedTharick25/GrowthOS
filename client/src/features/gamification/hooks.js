import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys.js';
import { gamificationApi } from './api.js';
export function useStreak() { return useQuery({ queryKey: queryKeys.streak, queryFn: gamificationApi.streak, staleTime: 30_000 }); }
export function useGamification() { return useQuery({ queryKey: queryKeys.gamification, queryFn: gamificationApi.profile, staleTime: 30_000 }); }
export function useBadges() { return useQuery({ queryKey: queryKeys.badges, queryFn: gamificationApi.badges, staleTime: 60_000 }); }
export function useRecoveryDay() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: gamificationApi.useRecovery, onSuccess: (streak) => { queryClient.setQueryData(queryKeys.streak, streak); queryClient.invalidateQueries({ queryKey: queryKeys.streak }); } });
}
