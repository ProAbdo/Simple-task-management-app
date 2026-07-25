import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .max(254, "Email cannot exceed 254 characters")
  .email("Enter a valid email address")
  .transform((email) => email.toLowerCase());

const bcryptPasswordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password cannot exceed 72 UTF-8 bytes",
  );

export const registerBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(80, "Name cannot exceed 80 characters"),
    email: emailSchema,
    password: bcryptPasswordSchema,
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1, "Password is required")
      .refine(
        (password) => Buffer.byteLength(password, "utf8") <= 72,
        "Password cannot exceed 72 UTF-8 bytes",
      ),
  })
  .strict();

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
