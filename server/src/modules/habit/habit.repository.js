import { Habit } from './habit.model.js';
export const habitRepository = {
  all: (userId) => Habit.find({ userId, isDeleted: false, isArchived: false }).sort({ order: 1, createdAt: 1 }).lean(),
  find: (userId, id) => Habit.findOne({ _id: id, userId, isDeleted: false }),
  count: (userId) => Habit.countDocuments({ userId }),
  createMany: (rows) => Habit.insertMany(rows), create: (row) => Habit.create(row),
  update: (userId, id, updates) => Habit.findOneAndUpdate({ _id: id, userId, isDeleted: false }, updates, { new: true, runValidators: true }),
};
