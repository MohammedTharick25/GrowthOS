import test from 'node:test';
import assert from 'node:assert/strict';
import { progressMetrics } from './analytics.service.js';

test('completion targets count saved priorities and habits on their actual schedules', () => {
  const data = {
    plans: [{ priorities: [{ identityKey: 'career', done: true }, { identityKey: 'health', done: false }] }],
    habits: [{ identityKey: 'career', schedule: 'weekdays' }, { identityKey: 'health', schedule: 'daily' }],
    checkins: [{ dateKey: '2026-10-26', habitId: { identityKey: 'career' } }],
  };
  const metrics = progressMetrics(data, '2026-10-26', '2026-10-27');
  assert.equal(metrics.target, 6);
  assert.equal(metrics.rate, 33);
  assert.deepEqual(metrics.areas.find((area) => area.key === 'career'), { key: 'career', score: 67, completed: 2, target: 3 });
  assert.deepEqual(metrics.areas.find((area) => area.key === 'health'), { key: 'health', score: 0, completed: 0, target: 3 });
});
