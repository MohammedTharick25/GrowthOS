import bcrypt from 'bcryptjs';
import { User } from './user.model.js';
import { Habit } from '../habit/habit.model.js';
import { Checkin } from '../checkin/checkin.model.js';
import { DailyPlan } from '../dailyPlan/dailyPlan.model.js';
import { Review } from '../review/review.model.js';
import { StudySession } from '../studySession/studySession.model.js';
import { CourageMoment } from '../courageMoment/courageMoment.model.js';
import { FinanceEntry } from '../finance/finance.model.js';
import { XPEvent, UserBadge } from '../gamification/gamification.model.js';
import { Journey } from '../journey/journey.model.js';
import { StreakState } from '../streak/streak.model.js';
import { ReminderDelivery } from './reminderDelivery.model.js';
import { AppError } from '../../utils/errorHandler.js';

const byUser = (Model, userId) => Model.find({ userId }).sort({ createdAt: 1 }).lean();

export const userDataService = {
  async export(id) {
    const user = await User.findById(id).lean();
    if (!user) throw new AppError('Account not found.', 404);
    const [habits, checkins, plans, reviews, studySessions, courageMoments, financeEntries, xpEvents, badges, journey, streak, reminderDeliveries] = await Promise.all([
      byUser(Habit, id), byUser(Checkin, id), byUser(DailyPlan, id), byUser(Review, id), byUser(StudySession, id), byUser(CourageMoment, id), byUser(FinanceEntry, id), byUser(XPEvent, id), byUser(UserBadge, id), Journey.findOne({ userId: id }).lean(), StreakState.findOne({ userId: id }).lean(), byUser(ReminderDelivery, id),
    ]);
    const { _id, name, email, emailVerified, timezone, theme, dailyTimeMinutes, reminderTimes, analyticsOptIn, streakRule, activeIdentityIds, identityStatements, onboardingDone, xp, level, createdAt, updatedAt } = user;
    const savedStatements = identityStatements?.toJSON?.() || (identityStatements instanceof Map ? Object.fromEntries(identityStatements) : identityStatements || {});
    return {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      description: 'This file includes your profile, identity statements, practice history, journal reflections, finance records, and progress data. Passwords and authentication tokens are never included.',
      profile: { id: String(_id), name, email, emailVerified, timezone, theme, dailyTimeMinutes, reminderTimes, analyticsOptIn, streakRule, activeIdentityIds, identityStatements: savedStatements, onboardingDone, xp, level, createdAt, updatedAt },
      data: { habits, checkins, dailyPlans: plans, reflections: reviews, studySessions, courageMoments, financeEntries, xpEvents, badges, journey, streak, reminderDeliveries },
    };
  },

  async deleteAccount(id, password) {
    const user = await User.findById(id).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError('The password is incorrect.', 401);
    const records = [Habit, Checkin, DailyPlan, Review, StudySession, CourageMoment, FinanceEntry, XPEvent, UserBadge, Journey, StreakState, ReminderDelivery];
    await Promise.all(records.map((Model) => Model.deleteMany({ userId: id })));
    await User.deleteOne({ _id: id });
    return { deleted: true };
  },
};
