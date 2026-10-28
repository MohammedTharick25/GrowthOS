import{Router}from'express';import{protect}from'../../utils/authMiddleware.js';import{current,start,advance,restart}from'./journey.controller.js';
const router=Router();router.use(protect);router.get('/current',current);router.post('/start',start);router.post('/advance',advance);router.post('/restart',restart);export default router;
