import { Router } from 'express';
import { protect } from '../../utils/authMiddleware.js';
import { validate } from '../../utils/validate.js';
import { addHabitSchema, updateHabitSchema } from './habit.validation.js';
import { getAll, add, update, archive } from './habit.controller.js';
const router=Router(); router.use(protect); router.get('/all',getAll); router.post('/add',validate(addHabitSchema),add); router.put('/update/:id',validate(updateHabitSchema),update); router.delete('/delete/:id',archive); export default router;
