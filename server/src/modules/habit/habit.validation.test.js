import test from 'node:test';
import assert from 'node:assert/strict';
import { addHabitSchema } from './habit.validation.js';
import { toggleSchema } from '../checkin/checkin.validation.js';

test('habit creation and check-in accept valid daily practice actions', () => {
  const habit = addHabitSchema.parse({ body: { identityKey: 'health', title: ' Walk after lunch ', schedule: 'weekdays' } });
  assert.equal(habit.body.title, 'Walk after lunch');
  assert.equal(habit.body.description, '');
  assert.equal(toggleSchema.safeParse({ body: { habitId: 'habit-id', minutes: 10 } }).success, true);
});

test('habit and check-in validation reject invalid values', () => {
  assert.equal(addHabitSchema.safeParse({ body: { identityKey: 'unknown', title: 'Practice' } }).success, false);
  assert.equal(toggleSchema.safeParse({ body: { habitId: '', minutes: 0 } }).success, false);
});
