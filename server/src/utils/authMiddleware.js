import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../modules/user/user.model.js';
import { AppError } from './errorHandler.js';
export async function protect(req, _res, next) {
  try {
    const token = req.cookies.auth_token;
    if (!token) throw new AppError('Please sign in to continue.', 401);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub).select('_id name email timezone theme dailyTimeMinutes reminderTimes analyticsOptIn streakRule activeIdentityIds onboardingDone xp level createdAt');
    if (!user) throw new AppError('Account not found.', 401);
    req.user = user; next();
  } catch (error) { next(error instanceof AppError ? error : new AppError('Your session has expired. Please sign in again.', 401)); }
}
