import cron from 'node-cron';
import { User } from '../modules/user/user.model.js';
import { StreakState } from '../modules/streak/streak.model.js';
import { streakService } from '../modules/streak/streak.service.js';
import { dateKeyAt, localTimeAt } from './dateHelpers.js';
import { ReminderDelivery } from '../modules/user/reminderDelivery.model.js';
import { sendPracticeReminder } from '../modules/auth/email.service.js';
import { env } from '../config/env.js';

let started = false;
export function startScheduler() {
  if (started) return;
  started = true;
  cron.schedule('0 * * * *', async () => {
    try {
      const users = await User.find().select('_id timezone createdAt streakRule').lean();
      for (const user of users) {
        const today = dateKeyAt(new Date(), user.timezone || 'Asia/Kolkata');
        const state = await StreakState.findOne({ userId: user._id }).select('lastRecomputedDateKey').lean();
        if (state?.lastRecomputedDateKey === today) continue;
        try { await streakService.recompute({ ...user, id: String(user._id) }); }
        catch (error) { console.error(`Streak rollover failed for a user: ${error.message}`); }
      }
    } catch (error) { console.error(`Streak rollover job failed: ${error.message}`); }
  }, { timezone: 'UTC' });

  cron.schedule('* * * * *', async () => {
    if (!env.RESEND_API_KEY || !env.MAIL_FROM) return;
    try {
      const users = await User.find({ emailVerified: true, $or: [
        { 'reminderTimes.morning': { $exists: true, $ne: '' } },
        { 'reminderTimes.evening': { $exists: true, $ne: '' } },
        { 'reminderTimes.weekly': { $exists: true, $ne: '' } },
      ] }).select('_id email timezone reminderTimes').lean();
      const now = new Date();
      for (const user of users) {
        const timezone = user.timezone || 'Asia/Kolkata';
        let dateKey; let localTime;
        try { dateKey = dateKeyAt(now, timezone); localTime = localTimeAt(now, timezone); }
        catch { continue; }
        const isMonday = new Date(`${dateKey}T12:00:00Z`).getUTCDay() === 1;
        for (const type of ['morning', 'evening', 'weekly']) {
          if (user.reminderTimes?.[type] !== localTime || (type === 'weekly' && !isMonday)) continue;
          try {
            await ReminderDelivery.create({ userId: user._id, dateKey, type });
          } catch (error) {
            if (error.code === 11000) continue;
            throw error;
          }
          const path = type === 'morning' ? '/app/plan' : '/app/review';
          const sent = await sendPracticeReminder({ to: user.email, type, link: new URL(path, env.CLIENT_ORIGIN).toString() });
          if (!sent) await ReminderDelivery.deleteOne({ userId: user._id, dateKey, type });
        }
      }
    } catch (error) { console.error(`Reminder delivery job failed: ${error.message}`); }
  }, { timezone: 'UTC' });
}
