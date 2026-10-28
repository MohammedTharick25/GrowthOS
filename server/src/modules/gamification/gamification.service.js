import { User } from '../user/user.model.js';
import { AppError } from '../../utils/errorHandler.js';
import { gamificationRepository } from './gamification.repository.js';

export const levels = [
  { name:'Beginner', min:0 }, { name:'Builder', min:100 }, { name:'Steady', min:300 },
  { name:'Resilient', min:700 }, { name:'Self-trusting', min:1400 }, { name:'Anchor', min:2500 },
];
export const badgeSeed = [
  ['first-step','First Step','You chose a meaningful action.','Sparkles',1],
  ['streak-3','3 day rhythm','Three active days, built one at a time.','Flame',2],
  ['streak-7','A week of showing up','Seven active days with room for rest.','Flame',3],
  ['streak-14','Two weeks of practice','Fourteen active days, at your pace.','Flame',4],
  ['streak-30','A month of practice','Thirty active days of steady effort.','Flame',5],
  ['streak-100','A hundred days','One hundred active days of becoming.','Flame',6],
  ['first-perfect','A full day','All three priorities and an evening reflection.','Check',7],
  ['courage-10','Ten values moments','You noticed ten moments of courage, honesty, or care.','Heart',8],
  ['weekly-4','Four weekly reflections','You made room to learn from four different weeks.','BookOpen',9],
  ['journey-complete','Journey complete','You completed a 30 day journey.','Compass',10],
  ['comeback','A kind return','You returned to your practice after a short pause.','RotateCcw',11],
  ['project-shipped','First project shipped','You made something real and shared it.','Rocket',12],
].map(([key,name,description,icon,order])=>({key,name,description,icon,order}));

export async function seedBadges() { await gamificationRepository.seedBadges(badgeSeed); }
export async function awardBadge(userId, key, metadata = {}) {
  const inserted = await gamificationRepository.awardBadge(userId, key, metadata);
  if (!inserted) return null;
  return gamificationRepository.badge(key);
}
const levelFor = (xp) => [...levels].reverse().find((level) => xp >= level.min) || levels[0];
export async function awardXp({ userId, type, points, refId, dateKey }) {
  try { await gamificationRepository.addEvent({ userId, type, points, refId, dateKey }); }
  catch (error) { if (error.code === 11000) return { xpDelta: 0, badgesAwarded: [] }; throw error; }
  const user = await User.findByIdAndUpdate(userId, { $inc: { xp: points } }, { new: true }).select('xp');
  if (!user) throw new AppError('Account not found.', 404);
  const level = levelFor(user.xp);
  await User.updateOne({ _id: userId }, { $set: { level: level.name } });
  const badgesAwarded = type === 'priority' || type === 'habit' ? [await awardBadge(userId, 'first-step')].filter(Boolean) : [];
  return { xpDelta: points, xp: user.xp, level: level.name, badgesAwarded };
}
export const gamificationService = {
  async profile(userId) {
    const user = await User.findById(userId).select('xp level'); if (!user) throw new AppError('Account not found.', 404);
    const current = levelFor(user.xp); const index = levels.findIndex((level) => level.name === current.name); const next = levels[index + 1] || null;
    return { xp: user.xp, level: current.name, nextLevel: next?.name || null, currentLevelMin: current.min, nextLevelMin: next?.min || null, progress: next ? Math.min(100, Math.round(((user.xp - current.min) / (next.min - current.min)) * 100)) : 100, recentEvents: await gamificationRepository.xpEvents(userId) };
  },
  async badges(userId) {
    await seedBadges(); const [definitions, earned] = await Promise.all([gamificationRepository.badges(), gamificationRepository.earned(userId)]);
    const earnedByKey = new Map(earned.map((item) => [item.badgeKey, item]));
    return definitions.map((badge) => ({ ...badge, earned: earnedByKey.has(badge.key), earnedAt: earnedByKey.get(badge.key)?.earnedAt || null }));
  },
};
