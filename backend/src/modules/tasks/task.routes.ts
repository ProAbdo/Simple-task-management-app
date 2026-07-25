import { Router } from "express";

import { authenticate } from "../../shared/middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middleware/validation.middleware.js";
import {
  addTaskAttachment,
  createTask,
  deleteTaskAttachment,
  deleteTask,
  downloadTaskAttachment,
  getTask,
  listTasks,
  updateTask,
} from "./task.controller.js";
import { uploadTaskAttachment } from "./task-attachment.middleware.js";
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  taskAttachmentParamsSchema,
  taskParamsSchema,
  updateTaskBodySchema,
} from "./task.validation.js";

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter
  .route("/")
  .get(validateQuery(listTasksQuerySchema), listTasks)
  .post(validateBody(createTaskBodySchema), createTask);

taskRouter
  .route("/:taskId/attachments")
  .post(
    validateParams(taskParamsSchema),
    uploadTaskAttachment,
    addTaskAttachment,
  );

taskRouter
  .route("/:taskId/attachments/:attachmentId")
  .all(validateParams(taskAttachmentParamsSchema))
  .get(downloadTaskAttachment)
  .delete(deleteTaskAttachment);

taskRouter
  .route("/:taskId")
  .all(validateParams(taskParamsSchema))
  .get(getTask)
  .patch(validateBody(updateTaskBodySchema), updateTask)
  .delete(deleteTask);
