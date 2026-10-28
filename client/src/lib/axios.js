import axios from 'axios';
import { store } from '../app/store.js';
import { clearSession, expireSession, failSessionRefresh, finishSessionRefresh, showSessionRefresh, startSessionRefresh } from '../store/slices/sessionSlice.js';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true, headers: { 'Content-Type': 'application/json' } });
let refreshRequest;
let resolveSessionDecision;

function askToContinue() {
  return new Promise((resolve) => { resolveSessionDecision = resolve; });
}

export function continueSessionRefresh() {
  if (!resolveSessionDecision) return;
  store.dispatch(startSessionRefresh());
  resolveSessionDecision(true);
  resolveSessionDecision = null;
}

export function logoutExpiredSession() {
  store.dispatch(clearSession());
  if (!resolveSessionDecision) return;
  resolveSessionDecision(false);
  resolveSessionDecision = null;
}

async function refreshWithPrompt(hadSession, initialSessionCheck) {
  if (!hadSession) {
    await axios.post(`${api.defaults.baseURL}/auth/v1/refresh`, {}, { withCredentials: true });
    if (initialSessionCheck) {
      store.dispatch(showSessionRefresh());
      const accepted = await askToContinue();
      if (!accepted) throw new Error('Session refresh cancelled.');
    }
    store.dispatch(finishSessionRefresh());
    return;
  }

  store.dispatch(showSessionRefresh());
  while (true) {
    const accepted = await askToContinue();
    if (!accepted) throw new Error('Session refresh cancelled.');
    try {
      await axios.post(`${api.defaults.baseURL}/auth/v1/refresh`, {}, { withCredentials: true });
      store.dispatch(finishSessionRefresh());
      return;
    } catch (refreshError) {
      const message = refreshError.response?.data?.error?.message || 'We couldn’t refresh your session. Check your connection and try again.';
      store.dispatch(failSessionRefresh(message));
    }
  }
}

api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  if (store.getState().session.user?.analyticsOptIn && (error.response?.status >= 500 || !error.response)) {
    const name = error.response ? 'api_server_error' : 'network_error';
    fetch(`${api.defaults.baseURL}/quality/v1/event`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'error', name }), keepalive: true }).catch(() => {});
  }
  if (error.response?.status !== 401 || original?._retried || original?.url?.includes('/auth/v1/refresh') || original?.url?.includes('/auth/v1/login') || original?.url?.includes('/auth/v1/signup')) return Promise.reject(error);
  original._retried = true;
  try {
    const hadSession = Boolean(store.getState().session.user);
    const initialSessionCheck = !hadSession && original?.url?.includes('/auth/v1/me');
    refreshRequest ||= refreshWithPrompt(hadSession, initialSessionCheck).finally(() => { refreshRequest = null; });
    await refreshRequest;
    return api(original);
  } catch (refreshError) {
    // A 401 from refresh means the refresh cookie is missing, expired, or revoked.
    // Keeping the authenticated client state would offer a refresh prompt that
    // cannot succeed and leave the user on a protected screen.
    if (refreshError.response?.status === 401) store.dispatch(expireSession());
    else if (!store.getState().session.user) store.dispatch(clearSession());
    return Promise.reject(refreshError);
  }
});
