import { z } from 'zod';

import { TaskPriority, TaskStatus } from '@/features/tasks/task.enums';
import type { Task } from '@/features/tasks/task.types';

const taskAttachmentSchema = z.object({
  id: z.string().min(1),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  uploadedAt: z.iso.datetime(),
});

export const taskSchema: z.ZodType<Task> = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string(),
  status: z.enum(TaskStatus),
  priority: z.enum(TaskPriority),
  dueDate: z.iso.datetime(),
  attachments: z.array(taskAttachmentSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const taskListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    tasks: z.array(taskSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      totalItems: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
    }),
  }),
});

export const taskMutationResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    task: taskSchema,
  }),
});

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(2_000, 'Description cannot exceed 2000 characters'),
  status: z.enum(TaskStatus, 'Choose a valid task status'),
  priority: z.enum(TaskPriority, 'Choose a valid task priority'),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine(
      (dueDate) => !Number.isNaN(new Date(dueDate).getTime()),
      'Enter a valid due date',
    ),
});

export const taskUpdateSchema = taskFormSchema
  .partial()
  .refine((values) => Object.keys(values).length > 0, {
    message: 'Provide at least one task field to update',
  });

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type TaskUpdateValues = z.infer<typeof taskUpdateSchema>;
