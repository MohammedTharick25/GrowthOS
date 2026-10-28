import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../store/slices/uiSlice.js';
import sessionReducer from '../store/slices/sessionSlice.js';
import onboardingReducer from '../store/slices/onboardingSlice.js';
import draftReducer from '../store/slices/draftSlice.js';
export const store = configureStore({ reducer: { ui: uiReducer, session: sessionReducer, onboarding: onboardingReducer, draft: draftReducer } });
