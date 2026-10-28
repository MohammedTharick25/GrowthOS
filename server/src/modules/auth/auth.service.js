import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { authRepository } from './auth.repository.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errorHandler.js';
import { hashToken, makeAccessToken, makeRefreshToken } from '../../utils/generateToken.js';
import { accountLink, sendAccountLink } from './email.service.js';

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified, timezone: user.timezone, theme: user.theme, activeIdentityIds: user.activeIdentityIds || [], analyticsOptIn: user.analyticsOptIn || false, onboardingDone: user.onboardingDone });
const issue = async (user) => { const refreshToken = makeRefreshToken(user.id); await authRepository.addToken(user, hashToken(refreshToken)); return { user: publicUser(user), accessToken: makeAccessToken(user.id), refreshToken }; };
const tokenExpiry = () => new Date(Date.now() + 60 * 60 * 1000);
const makeRawToken = () => randomBytes(32).toString('hex');
const developmentLink = (link) => env.NODE_ENV === 'production' ? undefined : link;

export const authService = {
  async signup(input) {
    if (await authRepository.findByEmail(input.email)) throw new AppError('An account with this email already exists.', 409);
    const token = makeRawToken();
    const user = await authRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      emailVerified: false,
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpiresAt: tokenExpiry(),
    });
    const link = accountLink('/verify-email', token);
    const sent = await sendAccountLink({ to: user.email, subject: 'Verify your GrowthOS email', intro: 'Confirm your email address to finish setting up your GrowthOS account.', link, action: 'Verify email' });
    return { email: user.email, verificationRequired: true, developmentVerificationUrl: !sent ? developmentLink(link) : undefined };
  },
  async login(input) {
    const user = await authRepository.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new AppError('Email or password is incorrect.', 401);
    if (!user.emailVerified) throw new AppError('Please verify your email before signing in.', 403);
    return issue(user);
  },
  async resendVerification(email) {
    const user = await authRepository.findByEmail(email);
    if (!user || user.emailVerified) return { message: 'If the account needs verification, an email has been sent.' };
    const token = makeRawToken();
    await authRepository.saveVerificationToken(user.id, hashToken(token), tokenExpiry());
    const link = accountLink('/verify-email', token);
    const sent = await sendAccountLink({ to: user.email, subject: 'Verify your GrowthOS email', intro: 'Confirm your email address to finish setting up your GrowthOS account.', link, action: 'Verify email' });
    return { message: 'If the account needs verification, an email has been sent.', developmentVerificationUrl: !sent ? developmentLink(link) : undefined };
  },
  async verifyEmail(token) {
    if (!token) throw new AppError('This verification link is invalid or expired.', 400);
    const user = await authRepository.findByVerificationHash(hashToken(token));
    if (!user) throw new AppError('This verification link is invalid or expired.', 400);
    await authRepository.markEmailVerified(user.id);
    return { email: user.email };
  },
  async requestPasswordReset(email) {
    const user = await authRepository.findByEmail(email);
    if (!user) return { message: 'If an account exists for that email, a reset link has been sent.' };
    const token = makeRawToken();
    await authRepository.savePasswordResetToken(user.id, hashToken(token), tokenExpiry());
    const link = accountLink('/reset-password', token);
    const sent = await sendAccountLink({ to: user.email, subject: 'Reset your GrowthOS password', intro: 'Use this one-time link to choose a new password. It expires in one hour.', link, action: 'Reset password' });
    return { message: 'If an account exists for that email, a reset link has been sent.', developmentResetUrl: !sent ? developmentLink(link) : undefined };
  },
  async resetPassword(token, password) {
    if (!token) throw new AppError('This reset link is invalid or expired.', 400);
    const user = await authRepository.findByPasswordResetHash(hashToken(token));
    if (!user) throw new AppError('This reset link is invalid or expired.', 400);
    await authRepository.resetPassword(user.id, await bcrypt.hash(password, 12));
    return { message: 'Your password has been reset. Please sign in with your new password.' };
  },
  async refresh(token) {
    if (!token) throw new AppError('Please sign in again.', 401);
    let payload; try { payload = jwt.verify(token, env.JWT_REFRESH_SECRET); } catch { throw new AppError('Please sign in again.', 401); }
    const user = await authRepository.findById(payload.sub); const digest = hashToken(token);
    if (!user || !user.refreshTokens.includes(digest)) throw new AppError('Please sign in again.', 401);
    await authRepository.removeToken(user, digest); return issue(user);
  },
  async logout(token) { if (!token) return; try { const payload = jwt.verify(token, env.JWT_REFRESH_SECRET); const user = await authRepository.findById(payload.sub); if (user) await authRepository.removeToken(user, hashToken(token)); } catch { /* expired cookies can still be cleared */ } },
  async me(id) { const user = await authRepository.findById(id); if (!user) throw new AppError('Account not found.', 404); return publicUser(user); },
};
