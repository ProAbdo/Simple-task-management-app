import { z } from 'zod';

const passwordWithinBcryptLimit = (password: string) =>
  new TextEncoder().encode(password).length <= 72;

const emailSchema = z
  .email('Enter a valid email address')
  .max(254, 'Email cannot exceed 254 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .refine(passwordWithinBcryptLimit, 'Password cannot exceed 72 UTF-8 bytes'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters')
    .max(80, 'Name cannot exceed 80 characters'),
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .refine(passwordWithinBcryptLimit, 'Password cannot exceed 72 UTF-8 bytes'),
});

export const authSessionSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.email(),
    createdAt: z.string().min(1),
  }),
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.string().min(1),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
