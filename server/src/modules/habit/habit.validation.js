import { z } from 'zod';
const identityKey = z.enum(['career','health','confidence','finance','family','discipline']);
export const addHabitSchema = z.object({ body: z.object({ identityKey, title: z.string().trim().min(1).max(120), description: z.string().max(400).optional().default(''), targetMinutes: z.number().int().min(1).max(1440).optional(), schedule: z.enum(['daily','weekdays']).optional() }).strict() });
export const updateHabitSchema = z.object({ body: z.object({ identityKey: identityKey.optional(), title: z.string().trim().min(1).max(120).optional(), description: z.string().max(400).optional(), targetMinutes: z.number().int().min(1).max(1440).nullable().optional(), schedule: z.enum(['daily','weekdays']).optional() }).strict(), params: z.object({ id: z.string().min(1) }) });
