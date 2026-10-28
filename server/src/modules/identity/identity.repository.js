import { Identity } from './identity.model.js';
export const identityRepository = { all: () => Identity.find().sort({ order: 1 }).lean(), findByKey: (key) => Identity.findOne({ key }).lean(), seed: (rows) => Identity.bulkWrite(rows.map((row) => ({ updateOne: { filter: { key: row.key }, update: { $setOnInsert: row }, upsert: true } }))) };
