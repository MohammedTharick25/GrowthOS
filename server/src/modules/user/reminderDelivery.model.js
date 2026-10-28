import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateKey: { type: String, required: true },
  type: { type: String, enum: ['morning', 'evening', 'weekly'], required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
}, { versionKey: false });

schema.index({ userId: 1, dateKey: 1, type: 1 }, { unique: true });

export const ReminderDelivery = mongoose.model('ReminderDelivery', schema);
