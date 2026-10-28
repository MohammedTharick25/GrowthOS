import { Badge, UserBadge, XPEvent } from './gamification.model.js';
export const gamificationRepository = {
  addEvent: (event) => XPEvent.create(event),
  xpEvents: (userId) => XPEvent.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
  seedBadges: (rows) => Badge.bulkWrite(rows.map((row) => ({ updateOne: { filter: { key: row.key }, update: { $setOnInsert: row }, upsert: true } }))),
  badges: () => Badge.find().sort({ order: 1 }).lean(),
  badge: (key) => Badge.findOne({ key }).lean(),
  earned: (userId) => UserBadge.find({ userId }).sort({ earnedAt: -1 }).lean(),
  countEarned: (userId, key) => UserBadge.countDocuments({ userId, badgeKey: key }),
  async awardBadge(userId, badgeKey, metadata = {}) {
    try { const result = await UserBadge.create({ userId, badgeKey, metadata }); return result; }
    catch (error) { if (error.code === 11000) return null; throw error; }
  },
};
