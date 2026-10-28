import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  dateKey: { type: String, required: true },
  kind: { type: String, enum: ['error', 'vital'], required: true },
  name: { type: String, required: true },
  count: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  min: Number,
  max: Number,
}, { timestamps: true, versionKey: false });
schema.index({ dateKey: 1, kind: 1, name: 1 }, { unique: true });
schema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const QualityMetric = mongoose.model('QualityMetric', schema);
