import { z } from 'zod';
const email = z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.').max(254, 'Email address must be 254 characters or fewer.').transform((value) => value.toLowerCase());
const password = z.string().min(8, 'Use at least 8 characters.').max(128, 'Password must be 128 characters or fewer.');
export const signupSchema = z.object({ body: z.object({ name: z.string().trim().min(1, 'Enter your name.').max(80, 'Name must be 80 characters or fewer.'), email, password }).strict() });
export const loginSchema = z.object({ body: z.object({ email, password: z.string().min(1, 'Enter your password.').max(128, 'Password must be 128 characters or fewer.') }).strict() });
export const emailSchema = z.object({ body: z.object({ email }).strict() });
export const tokenSchema = z.object({ body: z.object({ token: z.string().min(32).max(256) }).strict() });
export const resetPasswordSchema = z.object({ body: z.object({ token: z.string().min(32).max(256), password }).strict() });
