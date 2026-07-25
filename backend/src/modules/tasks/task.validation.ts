import { z } from "zod";

import {
  TaskPriority,
  TaskStatus,
} from "./task.enums.js";

const taskFieldsSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(120, "Title cannot exceed 120 characters"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(2_000, "Description cannot exceed 2000 characters"),
    status: z.enum(TaskStatus, "Choose a valid task status"),
    priority: z.enum(TaskPriority, "Choose a valid task priority"),
    dueDate: z
      .string()
      .datetime({ offset: true, error: "Due date must be a valid ISO date" })
      .transform((dueDate) => new Date(dueDate)),
  })
  .strict();

export const createTaskBodySchema = taskFieldsSchema;

export const updateTaskBodySchema = taskFieldsSchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Provide at least one task field to update",
  });

export const taskParamsSchema = z
  .object({
    taskId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Task ID must be a valid MongoDB ID"),
  })
  .strict();

export const taskAttachmentParamsSchema = taskParamsSchema.extend({
  attachmentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Attachment ID must be a valid MongoDB ID"),
});

export const listTasksQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .min(1, "Search cannot be empty")
      .max(120, "Search cannot exceed 120 characters")
      .optional(),
    status: z.enum(TaskStatus, "Choose a valid task status").optional(),
    priority: z
      .enum(TaskPriority, "Choose a valid task priority")
      .optional(),
    page: z.coerce
      .number()
      .int("Page must be a whole number")
      .min(1, "Page must be at least 1")
      .default(1),
    limit: z.coerce
      .number()
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(30, "Limit cannot exceed 30")
      .default(9),
  })
  .strict();

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;
export type TaskParams = z.infer<typeof taskParamsSchema>;
export type TaskAttachmentParams = z.infer<
  typeof taskAttachmentParamsSchema
>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
