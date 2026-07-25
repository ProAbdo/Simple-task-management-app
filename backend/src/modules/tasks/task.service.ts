import type { QueryFilter } from "mongoose";

import { TaskErrors } from "./task.errors.js";
import { toTaskResponse, type TaskResponse } from "./task.mapper.js";
import { TaskModel, type Task } from "./task.model.js";
import { deleteStoredAttachment } from "./task-attachment.storage.js";
import type {
  CreateTaskBody,
  ListTasksQuery,
  UpdateTaskBody,
} from "./task.validation.js";

export interface TaskPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TaskListResult {
  tasks: TaskResponse[];
  pagination: TaskPagination;
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createTask(
  ownerId: string,
  input: CreateTaskBody,
): Promise<TaskResponse> {
  const task = await TaskModel.create({
    owner: ownerId,
    ...input,
  });

  return toTaskResponse(task);
}

export async function listTasks(
  ownerId: string,
  query: ListTasksQuery,
): Promise<TaskListResult> {
  const filters: QueryFilter<Task> = { owner: ownerId };

  if (query.search) {
    filters.title = {
      $regex: escapeRegularExpression(query.search),
      $options: "i",
    };
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.priority) {
    filters.priority = query.priority;
  }

  const [tasks, totalItems] = await Promise.all([
    TaskModel.find(filters)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    TaskModel.countDocuments(filters),
  ]);
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / query.limit);

  return {
    tasks: tasks.map(toTaskResponse),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1 && totalPages > 0,
    },
  };
}

export async function getTask(
  ownerId: string,
  taskId: string,
): Promise<TaskResponse> {
  const task = await TaskModel.findOne({
    _id: taskId,
    owner: ownerId,
  });

  if (!task) {
    throw TaskErrors.notFound();
  }

  return toTaskResponse(task);
}

export async function updateTask(
  ownerId: string,
  taskId: string,
  input: UpdateTaskBody,
): Promise<TaskResponse> {
  const task = await TaskModel.findOneAndUpdate(
    {
      _id: taskId,
      owner: ownerId,
    },
    { $set: input },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!task) {
    throw TaskErrors.notFound();
  }

  return toTaskResponse(task);
}

export async function deleteTask(
  ownerId: string,
  taskId: string,
): Promise<void> {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    owner: ownerId,
  }).select("+attachments.storedName");

  if (!task) {
    throw TaskErrors.notFound();
  }

  const cleanupResults = await Promise.allSettled(
    task.attachments.map((attachment) =>
      deleteStoredAttachment(attachment.storedName),
    ),
  );

  for (const result of cleanupResults) {
    if (result.status === "rejected") {
      console.error("Unable to delete a task attachment", result.reason);
    }
  }
}
