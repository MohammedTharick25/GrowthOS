import { userRepository } from './user.repository.js';
import { AppError } from '../../utils/errorHandler.js';
import { habitRepository } from '../habit/habit.repository.js';
import { dailyPlanService } from '../dailyPlan/dailyPlan.service.js';
const publicProfile = (user) => { const data = user.toObject(); delete data.passwordHash; delete data.refreshTokens; return data; };
export const userService = {
  async profile(id) { const user = await userRepository.findById(id); if (!user) throw new AppError('Account not found.', 404); return publicProfile(user); },
  async update(id, updates) { const user = await userRepository.updateById(id, updates); if (!user) throw new AppError('Account not found.', 404); return publicProfile(user); },
  async completeOnboarding(id, input) {
    const { name, starterHabits = [], priorities = [], ...settings } = input;
    const user = await userRepository.updateById(id, { ...(name ? { name } : {}), ...settings, onboardingDone: true });
    if (!user) throw new AppError('Account not found.', 404);

    const existingHabits = await habitRepository.all(id);
    for (const [order, starter] of starterHabits.entries()) {
      const existing = existingHabits.find((habit) => habit.identityKey === starter.identityKey);
      if (existing) {
        if (existing.isDefault) await habitRepository.update(id, existing._id, { ...starter, isDefault: true });
        continue;
      }
      await habitRepository.create({ ...starter, userId: id, isDefault: true, order });
    }

    const plan = await dailyPlanService.today(user);
    if (!plan.morningDoneAt && priorities.length) {
      await dailyPlanService.save(user, { priorities, morningDoneAt: new Date().toISOString() });
    }
    return publicProfile(user);
  },
};
