export enum TaskStatus {
  Todo = "todo",
  InProgress = "in_progress",
  Done = "done",
}

export enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export const TASK_STATUS_VALUES = Object.values(TaskStatus);
export const TASK_PRIORITY_VALUES = Object.values(TaskPriority);
