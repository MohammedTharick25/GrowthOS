import { api } from '../../lib/axios.js';

export const practiceApi = {
  identities: async () => (await api.get('/identity/v1/all')).data.data.identities,
  habits: async () => (await api.get('/habit/v1/all')).data.data.habits,
  addHabit: async (habit) => (await api.post('/habit/v1/add', habit)).data.data.habit,
  archiveHabit: async (id) => api.delete(`/habit/v1/delete/${id}`),
  plan: async () => (await api.get('/dailyPlan/v1/today')).data.data.plan,
  savePlan: async (plan) => (await api.put('/dailyPlan/v1/today', plan)).data.data.plan,
  togglePriority: async (index) => (await api.put(`/dailyPlan/v1/priority/${index}/toggle`)).data.data,
  checkins: async () => (await api.get('/checkin/v1/today')).data.data.checkins,
  toggleHabit: async (habitId) => (await api.post('/checkin/v1/toggle', { habitId })).data.data,
  setHabitCheckin: async ({ habitId, dateKey, completed }) => (await api.put('/checkin/v1/state', { habitId, dateKey, completed })).data.data,
  saveReview: async (review) => (await api.post('/review/v1/daily', review)).data.data,
  studySession: async (session) => (await api.post('/studySession/v1/add', session)).data.data.session,
  courageMoment: async (moment) => (await api.post('/courageMoment/v1/add', moment)).data.data,
};
