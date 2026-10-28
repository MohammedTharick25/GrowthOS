import { z } from 'zod';
const priority = z.object({identityKey:z.enum(['career','health','confidence','finance','family','discipline']),text:z.string().max(240).optional().default(''),done:z.boolean().optional()}).strict();
const intent = z.object({if:z.string().trim().min(1).max(180),then:z.string().trim().min(1).max(240)}).strict();
export const savePlanSchema = z.object({body:z.object({priorities:z.array(priority).max(3).optional(),qualitiesToday:z.array(z.string().max(50)).max(12).optional(),ifThen:z.array(intent).max(10).optional(),morningDoneAt:z.string().datetime().optional()}).strict()});
export const togglePrioritySchema = z.object({params:z.object({index:z.coerce.number().int().min(0).max(2)})});
export const rangeSchema = z.object({query:z.object({from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)})});
