import {z} from 'zod';
export const toggleSchema=z.object({body:z.object({habitId:z.string().min(1),minutes:z.number().int().min(1).max(1440).optional(),note:z.string().max(500).optional()}).strict()});
export const setCheckinSchema=z.object({body:z.object({habitId:z.string().min(1),dateKey:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),completed:z.boolean()}).strict()});
export const rangeSchema=z.object({query:z.object({from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)})});
