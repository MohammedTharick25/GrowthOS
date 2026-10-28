import test from 'node:test';
import assert from 'node:assert/strict';
import sessionReducer, { clearSession, expireSession, failSessionRefresh, finishSessionRefresh, setSession, showSessionRefresh, startSessionRefresh } from './sessionSlice.js';

test('session expiry survives failed session hydration and clears after sign-in', () => {
  const expired = sessionReducer({ user: { id: 'user-1' }, status: 'authenticated', expired: false }, expireSession());
  const hydrated = sessionReducer(expired, setSession(null));
  assert.equal(hydrated.expired, true);

  const signedIn = sessionReducer(hydrated, setSession({ id: 'user-1' }));
  assert.equal(signedIn.expired, false);
  assert.equal(signedIn.status, 'authenticated');
});

test('explicit sign-out clears expiry notice', () => {
  const signedOut = sessionReducer({ user: null, status: 'anonymous', expired: true }, clearSession());
  assert.equal(signedOut.expired, false);
});

test('session refresh modal retains retry errors and closes after successful refresh', () => {
  let state = sessionReducer(undefined, showSessionRefresh());
  state = sessionReducer(state, startSessionRefresh());
  assert.equal(state.refreshing, true);

  state = sessionReducer(state, failSessionRefresh('Refresh token expired.'));
  assert.equal(state.refreshPrompt, true);
  assert.equal(state.refreshing, false);
  assert.equal(state.refreshError, 'Refresh token expired.');

  state = sessionReducer(state, startSessionRefresh());
  state = sessionReducer(state, finishSessionRefresh());
  assert.equal(state.refreshPrompt, false);
  assert.equal(state.refreshError, '');
});
