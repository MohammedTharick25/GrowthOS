import { z } from 'zod';

const errorEvent = z.object({ kind: z.literal('error'), name: z.enum(['window_error', 'unhandled_rejection', 'api_server_error', 'network_error']) }).strict();
const vitalEvent = z.object({ kind: z.literal('vital'), name: z.enum(['LCP', 'CLS', 'INP', 'TTFB']), value: z.number().finite().min(0).max(60000) }).strict();
export const qualityEventSchema = z.object({ body: z.discriminatedUnion('kind', [errorEvent, vitalEvent]) });
