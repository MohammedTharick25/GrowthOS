import{z}from'zod';
const range=z.enum(['7d','30d','90d','all']).default('30d');
export const trendsSchema=z.object({query:z.object({range}).default({range:'30d'})});
export const yearSchema=z.object({query:z.object({year:z.coerce.number().int().min(2000).max(2200).optional()}).default({})});
export const radarSchema=z.object({query:z.object({week:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()}).default({})});
