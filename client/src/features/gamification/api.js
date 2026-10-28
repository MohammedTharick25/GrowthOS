import { api } from '../../lib/axios.js';
export const gamificationApi = {
  streak: async () => (await api.get('/streak/v1/')).data.data.streak,
  profile: async () => (await api.get('/gamification/v1/profile')).data.data,
  badges: async () => (await api.get('/gamification/v1/badges')).data.data.badges,
  useRecovery: async () => (await api.post('/streak/v1/recovery/use')).data.data.streak,
};
