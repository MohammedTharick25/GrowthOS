import { createSlice } from '@reduxjs/toolkit';
const onboardingSlice = createSlice({ name: 'onboarding', initialState: { step: 0, name: '', activeIdentityIds: ['career', 'health', 'confidence'], dailyTimeMinutes: 60 }, reducers: {
  setOnboardingField(state, action) { state[action.payload.key] = action.payload.value; }, nextOnboardingStep(state) { state.step = Math.min(state.step + 1, 3); }, previousOnboardingStep(state) { state.step = Math.max(state.step - 1, 0); },
} });
export const { setOnboardingField, nextOnboardingStep, previousOnboardingStep } = onboardingSlice.actions;
export default onboardingSlice.reducer;
