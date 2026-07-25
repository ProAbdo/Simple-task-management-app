import { FileText, Paperclip, Trash2, UploadCloud } from 'lucide-react';
import { useState, type DragEvent } from 'react';

import {
  MAX_ATTACHMENTS_PER_TASK,
  TASK_ATTACHMENT_ACCEPT,
} from '@/features/tasks/task-attachment.constants';

interface TaskAttachmentPickerProps {
  disabled: boolean;
  error: string | null;
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (file: File) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskAttachmentPicker({
  disabled,
  error,
  files,
  onFileRemoved,
  onFilesAdded,
}: TaskAttachmentPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isAtLimit = files.length >= MAX_ATTACHMENTS_PER_TASK;

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (!disabled && !isAtLimit) {
      onFilesAdded(Array.from(event.dataTransfer.files));
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-700">
          Attachments{' '}
          <span className="font-semibold text-slate-400">(optional)</span>
        </span>
        <span className="text-xs font-semibold text-slate-400">
          {files.length}/{MAX_ATTACHMENTS_PER_TASK}
        </span>
      </div>

      <label
        className={`flex min-h-24 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-4 py-3 transition ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-200 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/50'
        } ${disabled || isAtLimit ? 'pointer-events-none opacity-55' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          accept={TASK_ATTACHMENT_ACCEPT}
          className="sr-only"
          disabled={disabled || isAtLimit}
          multiple
          onChange={(event) => {
            onFilesAdded(Array.from(event.target.files ?? []));
            event.target.value = '';
          }}
          type="file"
        />
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
          <UploadCloud aria-hidden="true" size={20} />
        </span>
        <span>
          <span className="block text-sm font-extrabold text-slate-800">
            Add files to this task
          </span>
          <span className="mt-1 block text-xs font-semibold text-slate-400">
            Drop or browse · PDF, images, text, or Word · 5 MB each
          </span>
        </span>
      </label>

      {error ? (
        <p className="mt-1.5 text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {files.map((file) => (
            <li
              className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
              key={`${file.name}-${file.size}-${file.lastModified}`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText aria-hidden="true" size={15} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-extrabold text-slate-700">
                  {file.name}
                </span>
                <span className="mt-0.5 block text-[0.65rem] font-semibold text-slate-400">
                  {formatFileSize(file.size)}
                </span>
              </span>
              <button
                aria-label={`Remove ${file.name}`}
                className="ml-auto grid size-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-4 focus-visible:ring-rose-500/10 focus-visible:outline-none"
                disabled={disabled}
                onClick={(event) => {
                  event.preventDefault();
                  onFileRemoved(file);
                }}
                type="button"
              >
                <Trash2 aria-hidden="true" size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Paperclip aria-hidden="true" size={13} />
          You can also manage files later from the task card.
        </p>
      )}
    </div>
  );
}
