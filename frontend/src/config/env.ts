import { z } from 'zod';

const apiBaseUrlSchema = z
  .string()
  .trim()
  .min(1, 'VITE_API_BASE_URL is required')
  .refine(
    (value) => /^\/(?!\/)/.test(value) || z.url().safeParse(value).success,
    'VITE_API_BASE_URL must be an absolute URL or a root-relative path',
  );

const envSchema = z.object({
  VITE_API_BASE_URL: apiBaseUrlSchema.default('http://localhost:5000/api/v1'),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid frontend environment configuration: ${issues}`);
}

export const env = Object.freeze({
  apiBaseUrl: parsedEnv.data.VITE_API_BASE_URL,
});
