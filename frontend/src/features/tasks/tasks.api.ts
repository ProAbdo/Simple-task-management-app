import { httpClient } from '@/api/http-client';
import {
  taskFormSchema,
  taskListResponseSchema,
  taskMutationResponseSchema,
  taskUpdateSchema,
  type TaskFormValues,
  type TaskUpdateValues,
} from '@/features/tasks/task.schemas';
import type {
  Task,
  TaskFilters,
  TaskListResult,
} from '@/features/tasks/task.types';

export async function listTasks(
  filters: TaskFilters = {},
): Promise<TaskListResult> {
  const response = await httpClient.get<unknown>('/tasks', {
    params: filters,
  });
  const result = taskListResponseSchema.parse(response.data);

  return result.data;
}

export async function getTask(taskId: string): Promise<Task> {
  const response = await httpClient.get<unknown>(`/tasks/${taskId}`);
  const result = taskMutationResponseSchema.parse(response.data);

  return result.data.task;
}

export async function createTask(input: TaskFormValues): Promise<Task> {
  const formValues = taskFormSchema.parse(input);
  const response = await httpClient.post<unknown>('/tasks', {
    ...formValues,
    dueDate: new Date(formValues.dueDate).toISOString(),
  });
  const result = taskMutationResponseSchema.parse(response.data);

  return result.data.task;
}

export async function updateTask(
  taskId: string,
  input: TaskUpdateValues,
): Promise<Task> {
  const values = taskUpdateSchema.parse(input);
  const response = await httpClient.patch<unknown>(`/tasks/${taskId}`, {
    ...values,
    ...(values.dueDate
      ? { dueDate: new Date(values.dueDate).toISOString() }
      : {}),
  });
  const result = taskMutationResponseSchema.parse(response.data);

  return result.data.task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await httpClient.delete(`/tasks/${taskId}`);
}

export async function uploadTaskAttachment(
  taskId: string,
  file: File,
): Promise<Task> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await httpClient.post<unknown>(
    `/tasks/${taskId}/attachments`,
    formData,
  );
  const result = taskMutationResponseSchema.parse(response.data);

  return result.data.task;
}

export async function downloadTaskAttachment(
  taskId: string,
  attachmentId: string,
): Promise<Blob> {
  const response = await httpClient.get<Blob>(
    `/tasks/${taskId}/attachments/${attachmentId}`,
    { responseType: 'blob' },
  );

  return response.data;
}

export async function deleteTaskAttachment(
  taskId: string,
  attachmentId: string,
): Promise<void> {
  await httpClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
}
