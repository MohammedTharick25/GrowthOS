import test from 'node:test';
import assert from 'node:assert/strict';
import { onboardingSchema, settingsSchema } from './user.validation.js';

test('onboarding requires a real first action and limits starter habits', () => {
  const base = {
    body: {
      activeIdentityIds: ['health'],
      dailyTimeMinutes: 45,
      timezone: 'Asia/Kolkata',
      starterHabits: [{ identityKey: 'health', title: 'Walk for ten minutes' }],
      priorities: [{ identityKey: 'health', text: 'Take a short walk' }],
    },
  };
  assert.equal(onboardingSchema.safeParse(base).success, true);
  assert.equal(onboardingSchema.safeParse({ body: { ...base.body, timezone: 'Not/A-Timezone' } }).success, false);
  assert.equal(onboardingSchema.safeParse({ body: { ...base.body, priorities: [] } }).success, false);
});

test('reminder settings accept local clock times and blank disabled values', () => {
  assert.equal(settingsSchema.safeParse({ body: { reminderTimes: { morning: '08:30', evening: '', weekly: '17:00' } } }).success, true);
  assert.equal(settingsSchema.safeParse({ body: { reminderTimes: { morning: '8:30' } } }).success, false);
});
