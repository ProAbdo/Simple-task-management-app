export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export const TASK_STATUS_VALUES = Object.values(TaskStatus);
export const TASK_PRIORITY_VALUES = Object.values(TaskPriority);

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'To do',
  [TaskStatus.InProgress]: 'In progress',
  [TaskStatus.Done]: 'Done',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'Low',
  [TaskPriority.Medium]: 'Medium',
  [TaskPriority.High]: 'High',
};
