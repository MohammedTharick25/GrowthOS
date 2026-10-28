import mongoose from 'mongoose';

const xpEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['priority','habit','dailyReview','weeklyReview','journeyPhase'], required: true },
  points: { type: Number, required: true, min: 0 }, refId: { type: String, required: true }, dateKey: { type: String, required: true },
}, { timestamps: true, versionKey: false });
xpEventSchema.index({ userId: 1, type: 1, refId: 1 }, { unique: true });

const badgeSchema = new mongoose.Schema({ key: { type: String, unique: true, required: true }, name: String, description: String, icon: String, order: Number }, { timestamps: true });
const userBadgeSchema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, badgeKey: { type: String, required: true }, earnedAt: { type: Date, default: Date.now }, metadata: mongoose.Schema.Types.Mixed }, { versionKey: false });
userBadgeSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });

export const XPEvent = mongoose.model('XPEvent', xpEventSchema);
export const Badge = mongoose.model('Badge', badgeSchema);
export const UserBadge = mongoose.model('UserBadge', userBadgeSchema);
