import{z}from'zod';
export const addSchema=z.object({body:z.object({text:z.string().trim().min(1).max(500),kind:z.enum(['courage','assertive','boundary','win']).default('courage')}).strict()});
export const rangeSchema=z.object({query:z.object({from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)})});
