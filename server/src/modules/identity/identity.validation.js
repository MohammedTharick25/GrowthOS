import { z } from 'zod';
export const statementSchema = z.object({ body: z.object({ statement: z.string().trim().min(5).max(240) }).strict(), params: z.object({ key: z.enum(['career','health','confidence','finance','family','discipline']) }) });
