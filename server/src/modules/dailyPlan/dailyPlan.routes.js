import {Router} from 'express';
import {protect} from '../../utils/authMiddleware.js';
import {validate} from '../../utils/validate.js';
import {savePlanSchema,togglePrioritySchema,rangeSchema} from './dailyPlan.validation.js';
import {getToday,saveToday,togglePriority,getRange} from './dailyPlan.controller.js';
const router=Router();router.use(protect);router.get('/today',getToday);router.put('/today',validate(savePlanSchema),saveToday);router.put('/priority/:index/toggle',validate(togglePrioritySchema),togglePriority);router.get('/range',validate(rangeSchema),getRange);export default router;
