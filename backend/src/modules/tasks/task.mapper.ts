import type {
  TaskPriority,
  TaskStatus,
} from "./task.enums.js";
import type { TaskDocument } from "./task.model.js";

export interface TaskAttachmentResponse {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  attachments: TaskAttachmentResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export function toTaskResponse(task: TaskDocument): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    attachments: task.attachments.map((attachment) => ({
      id: attachment._id.toString(),
      fileName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      uploadedAt: attachment.uploadedAt,
    })),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
