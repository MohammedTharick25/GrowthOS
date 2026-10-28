import {Router} from 'express';
import {protect} from '../../utils/authMiddleware.js';
import {getProfile,getBadges} from './gamification.controller.js';
const router=Router();router.use(protect);router.get('/profile',getProfile);router.get('/badges',getBadges);export default router;
