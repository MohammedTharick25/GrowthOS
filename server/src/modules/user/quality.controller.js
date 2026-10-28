import { QualityMetric } from './quality.model.js';

export async function recordQualityEvent(req, res, next) {
  try {
    if (!req.user.analyticsOptIn) return res.status(204).end();
    const { kind, name, value } = req.validated.body;
    const dateKey = new Date().toISOString().slice(0, 10);
    const update = { $inc: { count: 1 }, $setOnInsert: { dateKey, kind, name } };
    if (kind === 'vital') {
      update.$inc.total = value;
      update.$min = { min: value };
      update.$max = { max: value };
    }
    await QualityMetric.findOneAndUpdate({ dateKey, kind, name }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(202).json({ success: true });
  } catch (error) { next(error); }
}
