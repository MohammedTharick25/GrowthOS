import { createSlice } from '@reduxjs/toolkit';
const sessionSlice = createSlice({ name: 'session', initialState: { user: null, status: 'unknown', expired: false, refreshPrompt: false, refreshing: false, refreshError: '' }, reducers: {
  setSession(state, action) { state.user = action.payload; state.status = action.payload ? 'authenticated' : 'anonymous'; if (action.payload) state.expired = false; },
  clearSession(state) { state.user = null; state.status = 'anonymous'; state.expired = false; state.refreshPrompt = false; state.refreshing = false; state.refreshError = ''; },
  expireSession(state) { state.user = null; state.status = 'anonymous'; state.expired = true; state.refreshPrompt = false; state.refreshing = false; state.refreshError = ''; },
  showSessionRefresh(state) { state.refreshPrompt = true; state.refreshing = false; state.refreshError = ''; },
  startSessionRefresh(state) { state.refreshPrompt = true; state.refreshing = true; state.refreshError = ''; },
  failSessionRefresh(state, action) { state.refreshPrompt = true; state.refreshing = false; state.refreshError = action.payload || 'We couldn’t refresh your session. Please try again or log out.'; },
  finishSessionRefresh(state) { state.refreshPrompt = false; state.refreshing = false; state.refreshError = ''; state.expired = false; },
  setSessionStatus(state, action) { state.status = action.payload; },
} });
export const { setSession, clearSession, expireSession, showSessionRefresh, startSessionRefresh, failSessionRefresh, finishSessionRefresh, setSessionStatus } = sessionSlice.actions;
export default sessionSlice.reducer;
