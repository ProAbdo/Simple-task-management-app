import { randomUUID } from "node:crypto";

import type { RequestHandler } from "express";
import multer from "multer";

import { env } from "../../config/env.js";
import { TaskErrors } from "./task.errors.js";
import { ensureAttachmentDirectory } from "./task-attachment.storage.js";

const allowedMimeTypes = new Set([
  "application/msword",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

const maximumAttachmentSizeBytes =
  env.MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_request, _file, callback) => {
      try {
        await ensureAttachmentDirectory();
        callback(null, env.UPLOAD_DIRECTORY);
      } catch (error) {
        callback(error as Error, env.UPLOAD_DIRECTORY);
      }
    },
    filename: (_request, _file, callback) => {
      callback(null, randomUUID());
    },
  }),
  limits: {
    fileSize: maximumAttachmentSizeBytes,
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(TaskErrors.unsupportedAttachmentType());
      return;
    }

    callback(null, true);
  },
});

export const uploadTaskAttachment: RequestHandler = (
  request,
  response,
  next,
) => {
  upload.single("file")(request, response, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      next(
        error.code === "LIMIT_FILE_SIZE"
          ? TaskErrors.attachmentTooLarge(env.MAX_ATTACHMENT_SIZE_MB)
          : TaskErrors.invalidAttachment(),
      );
      return;
    }

    if (error) {
      next(error);
      return;
    }

    if (!request.file) {
      next(TaskErrors.attachmentRequired());
      return;
    }

    next();
  });
};
