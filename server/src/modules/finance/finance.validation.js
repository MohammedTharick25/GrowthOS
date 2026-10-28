import{z}from'zod';
const types=z.enum(['income','essential','optional','saved']);
export const addSchema=z.object({body:z.object({type:types,amount:z.coerce.number().positive().max(1_000_000_000),category:z.string().trim().min(1).max(80).optional().default('General'),note:z.string().max(500).optional().default(''),dateKey:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()}).strict()});
export const updateSchema=z.object({params:z.object({id:z.string().min(1)}),body:z.object({type:types.optional(),amount:z.coerce.number().positive().max(1_000_000_000).optional(),category:z.string().trim().min(1).max(80).optional(),note:z.string().max(500).optional(),dateKey:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()}).strict()});
export const rangeSchema=z.object({query:z.object({from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)})});
export const summarySchema=z.object({query:z.object({from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()}).default({})});
