export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_TASK = 5;
export const TASK_ATTACHMENT_ACCEPT =
  '.pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx';

export const TASK_ATTACHMENT_MIME_TYPES = new Set([
  'application/msword',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
]);

export function validateTaskAttachment(file: File): string | null {
  if (!TASK_ATTACHMENT_MIME_TYPES.has(file.type)) {
    return 'Choose a PDF, image, text file, or Word document.';
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return 'Attachments cannot exceed 5 MB.';
  }

  if (file.size === 0) {
    return 'The selected file is empty.';
  }

  return null;
}
