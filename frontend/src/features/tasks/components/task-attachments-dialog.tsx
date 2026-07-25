import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Download,
  File,
  FileText,
  Image,
  LoaderCircle,
  Paperclip,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent } from 'react';

import { getApiErrorMessage } from '@/api/api-error';
import {
  MAX_ATTACHMENTS_PER_TASK,
  TASK_ATTACHMENT_ACCEPT,
  validateTaskAttachment,
} from '@/features/tasks/task-attachment.constants';
import type { Task, TaskAttachment } from '@/features/tasks/task.types';
import {
  deleteTaskAttachment,
  downloadTaskAttachment,
  uploadTaskAttachment,
} from '@/features/tasks/tasks.api';

interface TaskAttachmentsDialogProps {
  task: Task;
  onClose: () => void;
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string): LucideIcon {
  if (mimeType.startsWith('image/')) {
    return Image;
  }

  if (mimeType === 'text/plain' || mimeType.includes('word')) {
    return FileText;
  }

  return File;
}

export function TaskAttachmentsDialog({
  onClose,
  task,
}: TaskAttachmentsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const [attachments, setAttachments] = useState(task.attachments);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadTaskAttachment(task.id, file),
    onSuccess: async (updatedTask) => {
      setAttachments(updatedTask.attachments);
      setClientError(null);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachment: TaskAttachment) =>
      deleteTaskAttachment(task.id, attachment.id),
    onSuccess: async (_result, attachment) => {
      setAttachments((current) =>
        current.filter((item) => item.id !== attachment.id),
      );
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (attachment: TaskAttachment) =>
      downloadTaskAttachment(task.id, attachment.id),
    onSuccess: (blob, attachment) => {
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.fileName;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const uploadFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (attachments.length >= MAX_ATTACHMENTS_PER_TASK) {
      setClientError('This task already has the maximum of 5 attachments.');
      return;
    }

    const validationError = validateTaskAttachment(file);

    if (validationError) {
      setClientError(validationError);
      return;
    }

    setClientError(null);
    uploadMutation.mutate(file);
  };

  const isBusy =
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    downloadMutation.isPending;
  const displayedError =
    clientError ??
    (uploadMutation.isError
      ? getApiErrorMessage(
          uploadMutation.error,
          'We could not upload this attachment.',
        )
      : deleteMutation.isError
        ? getApiErrorMessage(
            deleteMutation.error,
            'We could not delete this attachment.',
          )
        : downloadMutation.isError
          ? getApiErrorMessage(
              downloadMutation.error,
              'We could not download this attachment.',
            )
          : null);

  const closeDialog = () => {
    if (!isBusy) {
      onClose();
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    uploadFile(event.dataTransfer.files[0]);
  };

  return (
    <dialog
      aria-labelledby="attachments-title"
      className="task-dialog m-auto max-h-[calc(100vh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xl overflow-hidden rounded-[1.75rem] border-0 bg-white p-0 text-slate-950 shadow-2xl shadow-slate-950/25"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeDialog();
        }
      }}
      ref={dialogRef}
    >
      <div className="flex max-h-[calc(100vh-1.5rem)] flex-col">
        <header className="relative overflow-hidden border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-8 size-40 rounded-full bg-cyan-100 blur-3xl"
          />
          <div className="relative flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-cyan-300 shadow-lg shadow-slate-950/15">
              <Paperclip aria-hidden="true" size={19} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold tracking-[0.12em] text-indigo-600 uppercase">
                Task files
              </p>
              <h2
                className="mt-1 truncate text-2xl font-extrabold tracking-[-0.04em]"
                id="attachments-title"
              >
                Attachments
              </h2>
              <p className="mt-1 truncate text-sm text-slate-500">
                {task.title}
              </p>
            </div>
            <button
              aria-label="Close attachments"
              className="ml-auto grid size-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none disabled:opacity-50"
              disabled={isBusy}
              onClick={closeDialog}
              type="button"
            >
              <X aria-hidden="true" size={19} />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {displayedError ? (
            <div
              className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm leading-6 text-rose-700"
              role="alert"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                size={17}
              />
              {displayedError}
            </div>
          ) : null}

          <label
            className={`relative grid min-h-36 cursor-pointer place-items-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
              isDraggingFile
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/50'
            } ${isBusy || attachments.length >= MAX_ATTACHMENTS_PER_TASK ? 'pointer-events-none opacity-55' : ''}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              accept={TASK_ATTACHMENT_ACCEPT}
              className="sr-only"
              disabled={
                isBusy || attachments.length >= MAX_ATTACHMENTS_PER_TASK
              }
              onChange={(event) => {
                uploadFile(event.target.files?.[0]);
                event.target.value = '';
              }}
              type="file"
            />
            {uploadMutation.isPending ? (
              <div>
                <LoaderCircle
                  aria-hidden="true"
                  className="mx-auto animate-spin text-indigo-600"
                  size={27}
                />
                <p className="mt-3 text-sm font-extrabold text-slate-800">
                  Uploading securely...
                </p>
              </div>
            ) : (
              <div>
                <span className="mx-auto grid size-11 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <UploadCloud aria-hidden="true" size={21} />
                </span>
                <p className="mt-3 text-sm font-extrabold text-slate-800">
                  Drop a file here or browse
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  PDF, images, text, or Word · up to 5 MB
                </p>
              </div>
            )}
          </label>

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Uploaded files
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-500">
              {attachments.length}/{MAX_ATTACHMENTS_PER_TASK}
            </span>
          </div>

          {attachments.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-7 text-center">
              <Paperclip
                aria-hidden="true"
                className="mx-auto text-slate-300"
                size={23}
              />
              <p className="mt-2 text-sm font-bold text-slate-500">
                No attachments yet
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {attachments.map((attachment) => {
                const AttachmentIcon = getFileIcon(attachment.mimeType);
                const isDeleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables.id === attachment.id;
                const isDownloading =
                  downloadMutation.isPending &&
                  downloadMutation.variables.id === attachment.id;

                return (
                  <li
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                    key={attachment.id}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <AttachmentIcon aria-hidden="true" size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-800">
                        {attachment.fileName}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] font-semibold text-slate-400">
                        {formatFileSize(attachment.size)} ·{' '}
                        {dateFormatter.format(new Date(attachment.uploadedAt))}
                      </p>
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-1">
                      <button
                        aria-label={`Download ${attachment.fileName}`}
                        className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none disabled:opacity-50"
                        disabled={isBusy}
                        onClick={() => downloadMutation.mutate(attachment)}
                        type="button"
                      >
                        {isDownloading ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="animate-spin"
                            size={15}
                          />
                        ) : (
                          <Download aria-hidden="true" size={15} />
                        )}
                      </button>
                      <button
                        aria-label={`Delete ${attachment.fileName}`}
                        className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-4 focus-visible:ring-rose-500/10 focus-visible:outline-none disabled:opacity-50"
                        disabled={isBusy}
                        onClick={() => deleteMutation.mutate(attachment)}
                        type="button"
                      >
                        {isDeleting ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="animate-spin"
                            size={15}
                          />
                        ) : (
                          <Trash2 aria-hidden="true" size={15} />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  );
}
