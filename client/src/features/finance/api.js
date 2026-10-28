import { api } from '../../lib/axios.js';
export const financeApi = {
  range: async (from,to) => (await api.get('/finance/v1/range',{params:{from,to}})).data.data.entries,
  summary: async (from,to) => (await api.get('/finance/v1/summary',{params:{from,to}})).data.data.summary,
  add: async (entry) => (await api.post('/finance/v1/add',entry)).data.data.entry,
  remove: async (id) => api.delete(`/finance/v1/${id}`),
};
