import { User } from './user.model.js';
export const userRepository = {
  findById: (id) => User.findById(id),
  updateById: (id, updates) => User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-passwordHash -refreshTokens'),
};
