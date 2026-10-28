import{Router}from'express';import{protect}from'../../utils/authMiddleware.js';import{getStreak,useRecovery}from'./streak.controller.js';
const router=Router();router.use(protect);router.get('/',getStreak);router.post('/recovery/use',useRecovery);export default router;
