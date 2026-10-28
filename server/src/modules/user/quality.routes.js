import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../../utils/authMiddleware.js';
import { validate } from '../../utils/validate.js';
import { recordQualityEvent } from './quality.controller.js';
import { qualityEventSchema } from './quality.validation.js';

const router = Router();
router.post('/event', rateLimit({ windowMs: 15 * 60 * 1000, limit: 45, standardHeaders: true, legacyHeaders: false }), protect, validate(qualityEventSchema), recordQualityEvent);
export default router;
