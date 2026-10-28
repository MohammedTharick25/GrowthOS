import { api } from '../../lib/axios.js';
export const insightsApi = {
  trends: async (range) => (await api.get('/analytics/v1/trends', { params: { range } })).data.data.trends,
  radar: async () => (await api.get('/analytics/v1/radar')).data.data.radar,
  heatmap: async (year) => (await api.get('/analytics/v1/heatmap', { params: { year } })).data.data.heatmap,
  insights: async () => (await api.get('/analytics/v1/insights')).data.data.insights,
};
