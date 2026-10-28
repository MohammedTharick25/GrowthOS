import { Router } from 'express';
import { protect } from '../../utils/authMiddleware.js';
import { validate } from '../../utils/validate.js';
import { statementSchema } from './identity.validation.js';
import { getAll, getOne, saveStatement } from './identity.controller.js';
const router=Router(); router.use(protect); router.get('/all',getAll); router.get('/:key',getOne); router.put('/:key/statement',validate(statementSchema),saveStatement); export default router;
