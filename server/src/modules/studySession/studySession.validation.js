import{z}from'zod';
export const addSchema=z.object({body:z.object({minutes:z.coerce.number().int().min(1).max(1440),topic:z.string().max(160).optional().default(''),learned:z.string().max(1000).optional().default(''),explainedAloud:z.boolean().optional().default(false),projectId:z.string().max(100).optional()}).strict()});
export const rangeSchema=z.object({query:z.object({from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)})});
