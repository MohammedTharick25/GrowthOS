import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { env } from '../config/env.js';
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
export const makeAccessToken = (id) => jwt.sign({ sub: id }, env.JWT_ACCESS_SECRET, { expiresIn: `${env.ACCESS_TOKEN_MINUTES}m` });
export const makeRefreshToken = (id) => jwt.sign({ sub: id }, env.JWT_REFRESH_SECRET, { expiresIn: `${env.REFRESH_TOKEN_DAYS}d` });
export function setAuthCookies(res, access, refresh) {
  const common = { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax', path: '/' };
  res.cookie('auth_token', access, { ...common, maxAge: env.ACCESS_TOKEN_MINUTES * 60_000 });
  res.cookie('refreshToken', refresh, { ...common, maxAge: env.REFRESH_TOKEN_DAYS * 86_400_000 });
}
export function clearAuthCookies(res) { const common = { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax', path: '/' }; res.clearCookie('auth_token', common); res.clearCookie('refreshToken', common); }
