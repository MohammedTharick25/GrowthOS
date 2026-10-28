import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  emailVerified: { type: Boolean, default: true },
  emailVerificationTokenHash: { type: String, select: false }, emailVerificationExpiresAt: { type: Date, select: false },
  passwordResetTokenHash: { type: String, select: false }, passwordResetExpiresAt: { type: Date, select: false },
  passwordHash: { type: String, required: true, select: false }, refreshTokens: { type: [String], default: [], select: false },
  timezone: { type: String, default: 'Asia/Kolkata' }, theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  dailyTimeMinutes: { type: Number, default: 60 }, reminderTimes: { morning: String, evening: String, weekly: String }, analyticsOptIn: { type: Boolean, default: false },
  streakRule: { minPriorities: { type: Number, default: 1, min: 1, max: 3 } }, activeIdentityIds: { type: [String], default: ['career', 'health', 'confidence'] },
  identityStatements: { type: Map, of: String, default: {} }, onboardingDone: { type: Boolean, default: false },
  xp: { type: Number, default: 0 }, level: { type: String, default: 'Beginner' },
  recoveryTokens: { available: { type: Number, default: 1 }, lastGrantedWeek: String },
}, { timestamps: true, versionKey: false });
export const User = mongoose.model('User', userSchema);
