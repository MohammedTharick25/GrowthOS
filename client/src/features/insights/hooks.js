import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys.js';
import { insightsApi } from './api.js';
import { useSession } from '../auth/hooks.js';
import { dateKeyAt } from '../../lib/date.js';
export const useTrends = (range) => useQuery({ queryKey: queryKeys.analytics(range), queryFn: () => insightsApi.trends(range), staleTime: 60_000 });
export const useRadar = () => useQuery({ queryKey: ['analytics','radar'], queryFn: insightsApi.radar, staleTime: 60_000 });
export const useHeatmap = (year) => {
  const { data: user } = useSession();
  const userYear = Number(dateKeyAt(new Date(), user?.timezone).slice(0, 4));
  const selectedYear = user?.timezone ? userYear : year;
  return useQuery({ queryKey: queryKeys.heatmap(selectedYear), queryFn: () => insightsApi.heatmap(selectedYear), staleTime: 5 * 60_000 });
};
export const useInsights = () => useQuery({ queryKey: ['analytics','insights'], queryFn: insightsApi.insights, staleTime: 60_000 });
