import { User } from '../user/user.model.js';
export const authRepository = {
  findByEmail: (email) => User.findOne({ email }).select('+passwordHash +refreshTokens'),
  findById: (id) => User.findById(id).select('+refreshTokens'),
  create: (data) => User.create(data),
  findByVerificationHash: (tokenHash) => User.findOne({ emailVerificationTokenHash: tokenHash, emailVerificationExpiresAt: { $gt: new Date() } }).select('+emailVerificationTokenHash'),
  saveVerificationToken: (userId, tokenHash, expiresAt) => User.updateOne({ _id: userId }, { $set: { emailVerificationTokenHash: tokenHash, emailVerificationExpiresAt: expiresAt } }),
  markEmailVerified: (userId) => User.findByIdAndUpdate(userId, { $set: { emailVerified: true }, $unset: { emailVerificationTokenHash: 1, emailVerificationExpiresAt: 1 } }, { new: true }),
  findByPasswordResetHash: (tokenHash) => User.findOne({ passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } }).select('+passwordResetTokenHash'),
  savePasswordResetToken: (userId, tokenHash, expiresAt) => User.updateOne({ _id: userId }, { $set: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt } }),
  resetPassword: (userId, passwordHash) => User.findByIdAndUpdate(userId, { $set: { passwordHash, refreshTokens: [] }, $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } }, { new: true }).select('+passwordHash +refreshTokens'),
  addToken: async (user, tokenHash) => { user.refreshTokens.push(tokenHash); await user.save(); },
  removeToken: async (user, tokenHash) => { user.refreshTokens = user.refreshTokens.filter((item) => item !== tokenHash); await user.save(); },
};
