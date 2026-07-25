import type { NextFunction, Request, Response } from "express";

import { getAuthenticatedUserId } from "../../shared/middleware/auth.middleware.js";
import {
  addTaskAttachment as addTaskAttachmentRecord,
  deleteTaskAttachment as deleteTaskAttachmentRecord,
  getTaskAttachment as getTaskAttachmentRecord,
} from "./task-attachment.service.js";
import {
  createTask as createTaskRecord,
  deleteTask as deleteTaskRecord,
  getTask as getTaskRecord,
  listTasks as listTaskRecords,
  updateTask as updateTaskRecord,
} from "./task.service.js";
import type {
  CreateTaskBody,
  ListTasksQuery,
  TaskAttachmentParams,
  TaskParams,
  UpdateTaskBody,
} from "./task.validation.js";

export async function createTask(
  request: Request<unknown, unknown, CreateTaskBody>,
  response: Response,
): Promise<void> {
  const ownerId = getAuthenticatedUserId(request);
  const task = await createTaskRecord(ownerId, request.body);

  response.status(201).json({
    success: true,
    data: { task },
  });
}

export async function listTasks(
  request: Request,
  response: Response,
): Promise<void> {
  const ownerId = getAuthenticatedUserId(request);
  const query = response.locals.validatedQuery as ListTasksQuery;
  const result = await listTaskRecords(ownerId, query);

  response.status(200).json({
    success: true,
    data: result,
  });
}

export async function getTask(
  request: Request<TaskParams>,
  response: Response,
): Promise<void> {
  const ownerId = getAuthenticatedUserId(request);
  const task = await getTaskRecord(ownerId, request.params.taskId);

  response.status(200).json({
    success: true,
    data: { task },
  });
}

export async function updateTask(
  request: Request<TaskParams, unknown, UpdateTaskBody>,
  response: Response,
): Promise<void> {
  const ownerId = getAuthenticatedUserId(request);
  const task = await updateTaskRecord(
    ownerId,
    request.params.taskId,
    request.body,
  );

  response.status(200).json({
    success: true,
    data: { task },
  });
}

export async function deleteTask(
  request: Request<TaskParams>,
  response: Response,
): Promise<void> {
  const ownerId = getAuthenticatedUserId(request);
  await deleteTaskRecord(ownerId, request.params.taskId);

  response.status(204).send();
}

export async function addTaskAttachment(
  request: Request<TaskParams>,
  response: Response,
): Promise<void> {
  const ownerId = getAuthenticatedUserId(request);
  const task = await addTaskAttachmentRecord(
    ownerId,
    request.params.taskId,
    request.file!,
  );

  response.status(201).json({
    success: true,
    data: { task },
  });
}

export async function downloadTaskAttachment(
  request: Request<TaskAttachmentParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const ownerId = getAuthenticatedUserId(request);
  const attachment = await getTaskAttachmentRecord(
    ownerId,
    request.params.taskId,
    request.params.attachmentId,
  );

  response.type(attachment.mimeType);
  response.download(
    attachment.filePath,
    attachment.fileName,
    (error) => {
      if (error) {
        next(error);
      }
    },
  );
}

export async function deleteTaskAttachment(
  request: Request<TaskAttachmentParams>,
  response: Response,
): Promise<void> {
  const ownerId = getAuthenticatedUserId(request);
  await deleteTaskAttachmentRecord(
    ownerId,
    request.params.taskId,
    request.params.attachmentId,
  );

  response.status(204).send();
}
