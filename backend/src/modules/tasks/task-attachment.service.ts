import { access } from "node:fs/promises";

import { TaskErrors } from "./task.errors.js";
import { toTaskResponse, type TaskResponse } from "./task.mapper.js";
import { TaskModel } from "./task.model.js";
import { MAX_ATTACHMENTS_PER_TASK } from "./task-attachment.constants.js";
import {
  deleteStoredAttachment,
  getAttachmentPath,
} from "./task-attachment.storage.js";

interface DownloadableAttachment {
  filePath: string;
  fileName: string;
  mimeType: string;
}

function normalizeFileName(fileName: string): string {
  const normalizedName = fileName
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 255);

  return normalizedName || "attachment";
}

async function removeUploadedFile(storedName: string): Promise<void> {
  try {
    await deleteStoredAttachment(storedName);
  } catch (error) {
    console.error("Unable to clean up an uploaded attachment", error);
  }
}

export async function addTaskAttachment(
  ownerId: string,
  taskId: string,
  file: Express.Multer.File,
): Promise<TaskResponse> {
  const task = await TaskModel.findOne({
    _id: taskId,
    owner: ownerId,
  }).select("+attachments.storedName");

  if (!task) {
    await removeUploadedFile(file.filename);
    throw TaskErrors.notFound();
  }

  if (task.attachments.length >= MAX_ATTACHMENTS_PER_TASK) {
    await removeUploadedFile(file.filename);
    throw TaskErrors.attachmentLimitReached(MAX_ATTACHMENTS_PER_TASK);
  }

  task.attachments.push({
    originalName: normalizeFileName(file.originalname),
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  });

  try {
    await task.save();
  } catch (error) {
    await removeUploadedFile(file.filename);
    throw error;
  }

  return toTaskResponse(task);
}

export async function getTaskAttachment(
  ownerId: string,
  taskId: string,
  attachmentId: string,
): Promise<DownloadableAttachment> {
  const task = await TaskModel.findOne({
    _id: taskId,
    owner: ownerId,
  }).select("+attachments.storedName");

  if (!task) {
    throw TaskErrors.notFound();
  }

  const attachment = task.attachments.find(
    (item) => item._id.toString() === attachmentId,
  );

  if (!attachment) {
    throw TaskErrors.attachmentNotFound();
  }

  const filePath = getAttachmentPath(attachment.storedName);

  try {
    await access(filePath);
  } catch {
    throw TaskErrors.attachmentUnavailable();
  }

  return {
    filePath,
    fileName: attachment.originalName,
    mimeType: attachment.mimeType,
  };
}

export async function deleteTaskAttachment(
  ownerId: string,
  taskId: string,
  attachmentId: string,
): Promise<void> {
  const task = await TaskModel.findOne({
    _id: taskId,
    owner: ownerId,
  }).select("+attachments.storedName");

  if (!task) {
    throw TaskErrors.notFound();
  }

  const attachmentIndex = task.attachments.findIndex(
    (item) => item._id.toString() === attachmentId,
  );

  if (attachmentIndex === -1) {
    throw TaskErrors.attachmentNotFound();
  }

  const [attachment] = task.attachments.splice(attachmentIndex, 1);
  await task.save();

  if (!attachment) {
    return;
  }

  try {
    await deleteStoredAttachment(attachment.storedName);
  } catch (error) {
    console.error("Unable to delete an attachment file", error);
  }
}
