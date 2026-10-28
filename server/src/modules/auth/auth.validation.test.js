import test from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, resetPasswordSchema, signupSchema } from './auth.validation.js';

test('sign-up and sign-in accept valid credentials and normalize email', () => {
  const signup = signupSchema.parse({ body: { name: '  Alex  ', email: 'ALEX@example.com', password: 'long-enough-password' } });
  assert.equal(signup.body.name, 'Alex');
  assert.equal(signup.body.email, 'alex@example.com');
  assert.equal(loginSchema.safeParse({ body: { email: 'alex@example.com', password: 'secret' } }).success, true);
  assert.equal(loginSchema.safeParse({ body: { email: 'not-an-email', password: 'secret' } }).success, false);
});

test('password reset rejects short passwords and missing tokens', () => {
  assert.equal(resetPasswordSchema.safeParse({ body: { token: 'x'.repeat(32), password: 'new-password' } }).success, true);
  assert.equal(resetPasswordSchema.safeParse({ body: { token: 'short', password: 'new-password' } }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ body: { token: 'x'.repeat(32), password: 'short' } }).success, false);
});
