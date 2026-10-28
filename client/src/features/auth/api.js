import { api } from '../../lib/axios.js';

export const authApi = {
  me: async () => (await api.get('/auth/v1/me')).data.data.user,
  login: async (credentials) => (await api.post('/auth/v1/login', credentials)).data.data.user,
  signup: async (details) => (await api.post('/auth/v1/signup', details)).data.data.user,
  logout: async () => api.post('/auth/v1/logout'),
};
