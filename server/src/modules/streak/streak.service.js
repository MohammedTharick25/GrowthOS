import { User } from '../user/user.model.js';
import { dailyPlanRepository } from '../dailyPlan/dailyPlan.repository.js';
import { streakRepository } from './streak.repository.js';
import { awardBadge } from '../gamification/gamification.service.js';
import { dateKeyAt, shiftDateKey, weekKeyAt, weekKeyForDateKey } from '../../utils/dateHelpers.js';
import { AppError } from '../../utils/errorHandler.js';

const dayDifference = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
const countDone = (plan) => plan?.priorities?.filter((priority) => priority.done).length || 0;

export const streakService = {
  async recompute(user) {
    const today = dateKeyAt(new Date(), user.timezone || 'Asia/Kolkata');
    const yesterday = shiftDateKey(today, -1);
    const start = dateKeyAt(user.createdAt || new Date(), user.timezone || 'Asia/Kolkata');
    const [previous, plans, checkins] = await Promise.all([streakRepository.state(user.id), streakRepository.plans(user.id, start, today), streakRepository.habitCheckins(user.id, start, today)]);
    const planByDate = new Map(plans.map((plan) => [plan.dateKey, plan]));
    const recoveries = new Set(previous?.recoveryDays || []);
    const usedWeeks = new Set();
    let streak = 0; let best = previous?.best || 0; let lastActiveDateKey = null;
    const history = [];
    for (let key = start; key <= yesterday; key = shiftDateKey(key, 1)) {
      const done = countDone(planByDate.get(key));
      if (done >= (user.streakRule?.minPriorities || 1)) {
        streak += 1; lastActiveDateKey = key; history.push({ dateKey: key, status: 'active', prioritiesDone: done });
      } else if (recoveries.has(key)) {
        const week = weekKeyForDateKey(key);
        if (streak > 0 && !usedWeeks.has(week)) { streak += 1; usedWeeks.add(week); history.push({ dateKey: key, status: 'recovery', prioritiesDone: done }); }
        else { streak = 0; history.push({ dateKey: key, status: 'missed', prioritiesDone: done }); }
      } else if (streak > 0) {
        const week = weekKeyForDateKey(key);
        if (!usedWeeks.has(week)) { recoveries.add(key); usedWeeks.add(week); streak += 1; history.push({ dateKey: key, status: 'recovery', prioritiesDone: done }); }
        else { streak = 0; history.push({ dateKey: key, status: 'missed', prioritiesDone: done }); }
      } else history.push({ dateKey: key, status: 'missed', prioritiesDone: done });
      best = Math.max(best, streak);
    }
    const todayDone = countDone(planByDate.get(today));
    let current = streak;
    let todayStatus = 'pending';
    if (todayDone >= (user.streakRule?.minPriorities || 1)) { current = streak + 1; lastActiveDateKey = today; todayStatus = 'active'; }
    else if (recoveries.has(today) && streak > 0) { current = streak + 1; todayStatus = 'recovery'; }
    best = Math.max(best, current);
    history.push({ dateKey: today, status: todayStatus, prioritiesDone: todayDone });
    const currentWeek = weekKeyAt(new Date(), user.timezone || 'Asia/Kolkata');
    const usedThisWeek = recoveries.has(today) || usedWeeks.has(currentWeek) || [...recoveries].some((key) => weekKeyForDateKey(key) === currentWeek);
    const recoveryDays = [...recoveries].sort().slice(-2000);
    const recoveryUsedWeeks = [...new Set([...usedWeeks, ...recoveryDays.map(weekKeyForDateKey)])].sort();
    let state;
    const updates = { current, best, lastActiveDateKey, lastRecomputedDateKey: today, recoveryDays, recoveryUsedWeeks, history: history.slice(-400) };
    try { state = await streakRepository.save(user.id, updates); }
    catch (error) { if (error.code !== 11000) throw error; state = await streakRepository.save(user.id, updates); }
    const available = usedThisWeek ? 0 : 1;
    await User.updateOne({ _id: user.id }, { $set: { 'recoveryTokens.available': available, 'recoveryTokens.lastGrantedWeek': currentWeek } });
    const habitDays = new Map();
    for (const checkin of checkins) { const id=String(checkin.habitId); if(!habitDays.has(id))habitDays.set(id,new Set()); habitDays.get(id).add(checkin.dateKey); }
    const habitStreaks = [...habitDays].map(([habitId,days])=>{
      let run=0;let habitBest=0;
      for(let key=start;key<=today;key=shiftDateKey(key,1)){run=days.has(key)?run+1:0;habitBest=Math.max(habitBest,run);}
      let current=0;let key=days.has(today)?today:yesterday;
      while(key>=start&&days.has(key)){current+=1;key=shiftDateKey(key,-1);}
      return {habitId,current,best:habitBest,lastCompletedDateKey:[...days].sort().at(-1)||null};
    }).sort((a,b)=>b.current-a.current);
    const streakBadges = [[3,'streak-3'],[7,'streak-7'],[14,'streak-14'],[30,'streak-30'],[100,'streak-100']].filter(([days]) => best >= days);
    const badgesAwarded = (await Promise.all(streakBadges.map(([, key]) => awardBadge(user.id, key)))).filter(Boolean);
    return { current, best, lastActiveDateKey, todayStatus, todayPrioritiesDone: todayDone, recoveryTokensAvailable: available, recoveryUsedThisWeek: usedThisWeek, habitStreaks, history: state.history, badgesAwarded };
  },
  async useRecovery(user) {
    const data = await this.recompute(user);
    const today = dateKeyAt(new Date(), user.timezone || 'Asia/Kolkata');
    const week = weekKeyAt(new Date(), user.timezone || 'Asia/Kolkata');
    const todayPlan = await dailyPlanRepository.get(user.id, today);
    if (countDone(todayPlan) >= (user.streakRule?.minPriorities || 1)) throw new AppError('Today is already an active day. Your recovery token is still available.', 409);
    if (!data.current) throw new AppError('Build a little rhythm first, then use a recovery day when you need it.', 409);
    if (data.recoveryTokensAvailable < 1) throw new AppError('This week’s recovery day has already been used.', 409);
    const existing = await streakRepository.state(user.id);
    const recoveryDays = [...new Set([...(existing?.recoveryDays || []), today])];
    const recoveryUsedWeeks = [...new Set([...(existing?.recoveryUsedWeeks || []), week])];
    await streakRepository.save(user.id, { recoveryDays, recoveryUsedWeeks });
    return this.recompute(user);
  },
  async recordPriorityCompletion(user, dateKey) {
    const prior = await streakRepository.state(user.id);
    const plan = await dailyPlanRepository.get(user.id, dateKey);
    const dayIsActive = countDone(plan) >= (user.streakRule?.minPriorities || 1);
    if (dayIsActive && prior?.lastActiveDateKey) {
      const gap = dayDifference(prior.lastActiveDateKey, dateKey);
      if (gap >= 2 && gap <= 3) await awardBadge(user.id, 'comeback', { returnedDateKey: dateKey });
    }
    return this.recompute(user);
  },
  get: (user) => streakService.recompute(user),
};
