import { mkdir, unlink } from "node:fs/promises";
import { resolve, sep } from "node:path";

import { env } from "../../config/env.js";

export async function ensureAttachmentDirectory(): Promise<void> {
  await mkdir(env.UPLOAD_DIRECTORY, { recursive: true });
}

export function getAttachmentPath(storedName: string): string {
  const filePath = resolve(env.UPLOAD_DIRECTORY, storedName);
  const directoryPrefix = `${env.UPLOAD_DIRECTORY}${sep}`;

  if (!filePath.startsWith(directoryPrefix)) {
    throw new Error("Attachment path escaped the configured upload directory");
  }

  return filePath;
}

export async function deleteStoredAttachment(
  storedName: string,
): Promise<void> {
  try {
    await unlink(getAttachmentPath(storedName));
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }

    throw error;
  }
}
