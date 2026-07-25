import { AppError } from "../../shared/errors/app-error.js";

export const TaskErrors = {
  notFound: () =>
    new AppError(404, "TASK_NOT_FOUND", "Task not found"),
  attachmentRequired: () =>
    new AppError(400, "ATTACHMENT_REQUIRED", "Choose a file to upload"),
  invalidAttachment: () =>
    new AppError(
      400,
      "INVALID_ATTACHMENT",
      "The attachment upload is invalid",
    ),
  unsupportedAttachmentType: () =>
    new AppError(
      415,
      "UNSUPPORTED_ATTACHMENT_TYPE",
      "Only PDF, image, text, and Word document attachments are supported",
    ),
  attachmentTooLarge: (maximumSizeMb: number) =>
    new AppError(
      413,
      "ATTACHMENT_TOO_LARGE",
      `Attachments cannot exceed ${maximumSizeMb} MB`,
    ),
  attachmentLimitReached: (maximumAttachments: number) =>
    new AppError(
      409,
      "ATTACHMENT_LIMIT_REACHED",
      `A task can contain up to ${maximumAttachments} attachments`,
    ),
  attachmentNotFound: () =>
    new AppError(404, "ATTACHMENT_NOT_FOUND", "Attachment not found"),
  attachmentUnavailable: () =>
    new AppError(
      404,
      "ATTACHMENT_UNAVAILABLE",
      "The attachment file is unavailable",
    ),
};
