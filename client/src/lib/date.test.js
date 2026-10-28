import test from 'node:test';
import assert from 'node:assert/strict';
import { dateKeyAt } from './date.js';

test('dateKeyAt uses the requested user timezone across midnight', () => {
  const instant = new Date('2026-10-28T02:00:00.000Z');
  assert.equal(dateKeyAt(instant, 'Asia/Kolkata'), '2026-10-28');
  assert.equal(dateKeyAt(instant, 'America/Los_Angeles'), '2026-10-27');
});
