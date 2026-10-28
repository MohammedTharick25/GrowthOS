import { createSlice } from '@reduxjs/toolkit';
const initialState = { theme: localStorage.getItem('growthos-theme') || 'system', toast: null, sheet: null };
const uiSlice = createSlice({ name: 'ui', initialState, reducers: {
  setTheme(state, action) { state.theme = action.payload; localStorage.setItem('growthos-theme', action.payload); const dark = action.payload === 'dark' || (action.payload === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.dataset.theme = dark ? 'dark' : 'light'; },
  showToast(state, action) { state.toast = action.payload; }, clearToast(state) { state.toast = null; }, setSheet(state, action) { state.sheet = action.payload; },
} });
export const { setTheme, showToast, clearToast, setSheet } = uiSlice.actions;
export default uiSlice.reducer;
