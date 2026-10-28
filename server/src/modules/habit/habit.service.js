import { habitRepository } from './habit.repository.js';
import { AppError } from '../../utils/errorHandler.js';
const starters = { career:'Learn and practise one useful skill', health:'Do one thing to care for my body', confidence:'Take one values-led action', finance:'Review one expense or learn a money concept', family:'Connect thoughtfully and respect my needs', discipline:'Choose three important actions' };
export const habitService = {
  async all(user) { let habits = await habitRepository.all(user.id); if (!habits.length && await habitRepository.count(user.id) === 0) { const keys = user.activeIdentityIds?.length ? user.activeIdentityIds : ['career','health','confidence']; await habitRepository.createMany(keys.map((key, order) => ({ userId:user.id, identityKey:key, title:starters[key], description:'A small practice, at your pace.', isDefault:true, order }))); habits = await habitRepository.all(user.id); } return habits; },
  add: (userId, input) => habitRepository.create({ ...input, userId, isDefault:false, order:Date.now() }),
  async update(userId, id, input) { const habit = await habitRepository.update(userId, id, input); if (!habit) throw new AppError('Habit not found.', 404); return habit; },
  async archive(userId, id) { const habit = await habitRepository.update(userId, id, { isDeleted:true, isArchived:true, deletedAt:new Date() }); if (!habit) throw new AppError('Habit not found.', 404); return habit; },
};
