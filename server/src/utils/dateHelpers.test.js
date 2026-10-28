import test from 'node:test';
import assert from 'node:assert/strict';
import { dateKeyAt, localTimeAt } from './dateHelpers.js';

test('local reminder clock follows the configured timezone', () => {
  const instant = new Date('2026-10-28T12:00:00.000Z');
  assert.equal(dateKeyAt(instant, 'Asia/Kolkata'), '2026-10-28');
  assert.equal(localTimeAt(instant, 'Asia/Kolkata'), '17:30');
  assert.equal(localTimeAt(instant, 'America/New_York'), '08:00');
});
