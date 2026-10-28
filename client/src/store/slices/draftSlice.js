import { createSlice } from '@reduxjs/toolkit';
const savedDraft = (() => { try { return JSON.parse(localStorage.getItem('growthos-draft') || '{}'); } catch { return {}; } })();
const draftSlice = createSlice({ name: 'draft', initialState: { plan: savedDraft.plan || {}, review: savedDraft.review || {} }, reducers: {
  updatePlanDraft(state, action) { state.plan = { ...state.plan, ...action.payload }; localStorage.setItem('growthos-draft', JSON.stringify({ ...savedDraft, plan: state.plan, review: state.review })); },
  updateReviewDraft(state, action) { state.review = { ...state.review, ...action.payload }; localStorage.setItem('growthos-draft', JSON.stringify({ ...savedDraft, plan: state.plan, review: state.review })); }, clearDrafts(state) { state.plan = {}; state.review = {}; localStorage.removeItem('growthos-draft'); },
} });
export const { updatePlanDraft, updateReviewDraft, clearDrafts } = draftSlice.actions;
export default draftSlice.reducer;
