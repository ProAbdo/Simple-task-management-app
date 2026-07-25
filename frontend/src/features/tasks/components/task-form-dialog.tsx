import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CalendarClock,
  Check,
  Circle,
  Clock3,
  Flag,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch, type UseFormRegister } from 'react-hook-form';

import { getApiErrorMessage } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { TaskAttachmentPicker } from '@/features/tasks/components/task-attachment-picker';
import {
  MAX_ATTACHMENTS_PER_TASK,
  validateTaskAttachment,
} from '@/features/tasks/task-attachment.constants';
import { TaskPriority, TaskStatus } from '@/features/tasks/task.enums';
import {
  taskFormSchema,
  type TaskFormValues,
} from '@/features/tasks/task.schemas';
import type { Task } from '@/features/tasks/task.types';
import {
  createTask,
  updateTask,
  uploadTaskAttachment,
} from '@/features/tasks/tasks.api';

interface TaskFormDialogProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSaved: (
    task: Task,
    action: 'created' | 'updated',
    failedAttachmentCount: number,
  ) => void;
}

interface RadioOption<T extends string> {
  value: T;
  label: string;
  description: string;
  icon: LucideIcon;
  selectedClassName: string;
}

interface SaveTaskResult {
  task: Task;
  failedAttachmentCount: number;
}

const statusOptions: RadioOption<TaskStatus>[] = [
  {
    value: TaskStatus.Todo,
    label: 'To do',
    description: 'Ready to begin',
    icon: Circle,
    selectedClassName:
      'peer-checked:border-slate-800 peer-checked:bg-slate-950 peer-checked:text-white',
  },
  {
    value: TaskStatus.InProgress,
    label: 'In progress',
    description: 'Currently moving',
    icon: Clock3,
    selectedClassName:
      'peer-checked:border-amber-400 peer-checked:bg-amber-50 peer-checked:text-amber-800',
  },
  {
    value: TaskStatus.Done,
    label: 'Done',
    description: 'Already finished',
    icon: Check,
    selectedClassName:
      'peer-checked:border-emerald-400 peer-checked:bg-emerald-50 peer-checked:text-emerald-800',
  },
];

const priorityOptions: RadioOption<TaskPriority>[] = [
  {
    value: TaskPriority.Low,
    label: 'Low',
    description: 'Can wait',
    icon: Flag,
    selectedClassName:
      'peer-checked:border-sky-300 peer-checked:bg-sky-50 peer-checked:text-sky-800',
  },
  {
    value: TaskPriority.Medium,
    label: 'Medium',
    description: 'Important',
    icon: Flag,
    selectedClassName:
      'peer-checked:border-violet-300 peer-checked:bg-violet-50 peer-checked:text-violet-800',
  },
  {
    value: TaskPriority.High,
    label: 'High',
    description: 'Needs focus',
    icon: Flag,
    selectedClassName:
      'peer-checked:border-rose-300 peer-checked:bg-rose-50 peer-checked:text-rose-800',
  },
];

function formatLocalDateTime(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDefaultFormValues(task: Task | null): TaskFormValues {
  if (task) {
    return {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: formatLocalDateTime(new Date(task.dueDate)),
    };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);
  dueDate.setHours(17, 0, 0, 0);

  return {
    title: '',
    description: '',
    status: TaskStatus.Todo,
    priority: TaskPriority.Medium,
    dueDate: formatLocalDateTime(dueDate),
  };
}

export function TaskFormDialog({
  isOpen,
  task,
  onClose,
  onSaved,
}: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: getDefaultFormValues(null),
    mode: 'onTouched',
  });
  const description = useWatch({
    control,
    name: 'description',
  });

  const saveMutation = useMutation({
    mutationFn: async (values: TaskFormValues): Promise<SaveTaskResult> => {
      if (task) {
        return {
          task: await updateTask(task.id, values),
          failedAttachmentCount: 0,
        };
      }

      let savedTask = await createTask(values);
      let failedAttachmentCount = 0;

      for (const file of attachmentFiles) {
        try {
          savedTask = await uploadTaskAttachment(savedTask.id, file);
        } catch {
          failedAttachmentCount += 1;
        }
      }

      return { task: savedTask, failedAttachmentCount };
    },
    onSuccess: async ({ failedAttachmentCount, task: savedTask }) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      reset(getDefaultFormValues(null));
      setAttachmentFiles([]);
      setAttachmentError(null);
      onSaved(savedTask, task ? 'updated' : 'created', failedAttachmentCount);
      onClose();
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      reset(getDefaultFormValues(task));
      setAttachmentFiles([]);
      setAttachmentError(null);
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, reset, task]);

  const requestClose = () => {
    if (saveMutation.isPending) {
      return;
    }

    saveMutation.reset();
    reset(getDefaultFormValues(task));
    setAttachmentFiles([]);
    setAttachmentError(null);
    onClose();
  };

  const addAttachmentFiles = (files: File[]) => {
    const nextFiles = [...attachmentFiles];
    let nextError: string | null = null;

    for (const file of files) {
      if (nextFiles.length >= MAX_ATTACHMENTS_PER_TASK) {
        nextError = 'A task can contain up to 5 attachments.';
        break;
      }

      const validationError = validateTaskAttachment(file);

      if (validationError) {
        nextError = `${file.name}: ${validationError}`;
        continue;
      }

      const isDuplicate = nextFiles.some(
        (currentFile) =>
          currentFile.name === file.name &&
          currentFile.size === file.size &&
          currentFile.lastModified === file.lastModified,
      );

      if (!isDuplicate) {
        nextFiles.push(file);
      }
    }

    setAttachmentFiles(nextFiles);
    setAttachmentError(nextError);
  };

  const onSubmit = handleSubmit((values) => {
    saveMutation.mutate(values);
  });

  return (
    <dialog
      aria-labelledby="task-form-title"
      className="task-dialog m-auto max-h-[calc(100vh-1.5rem)] w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden rounded-[1.75rem] border-0 bg-white p-0 text-slate-950 shadow-2xl shadow-slate-950/25"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
      ref={dialogRef}
    >
      <form
        className="flex max-h-[calc(100vh-1.5rem)] flex-col"
        noValidate
        onSubmit={onSubmit}
      >
        <header className="relative overflow-hidden border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
          <div
            className="absolute -top-20 -right-12 size-48 rounded-full bg-indigo-100/80 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-indigo-300 shadow-lg shadow-slate-950/15">
              {task ? (
                <Pencil aria-hidden="true" size={19} strokeWidth={2.5} />
              ) : (
                <Plus aria-hidden="true" size={21} strokeWidth={2.5} />
              )}
            </span>
            <div>
              <p className="text-xs font-extrabold tracking-[0.12em] text-indigo-600 uppercase">
                {task ? 'Edit task' : 'New task'}
              </p>
              <h2
                className="mt-1 text-2xl font-extrabold tracking-[-0.04em]"
                id="task-form-title"
              >
                {task ? 'Refine the plan.' : 'What needs your attention?'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {task
                  ? 'Update the details, priority, status, or deadline as the work evolves.'
                  : 'Capture the outcome, choose its importance, and give it a clear deadline.'}
              </p>
            </div>
            <button
              aria-label={`Close ${task ? 'edit' : 'create'} task dialog`}
              className="ml-auto grid size-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saveMutation.isPending}
              onClick={requestClose}
              type="button"
            >
              <X aria-hidden="true" size={19} />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {saveMutation.isError ? (
            <div
              className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700"
              role="alert"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                size={18}
              />
              {getApiErrorMessage(
                saveMutation.error,
                `We could not ${task ? 'update' : 'create'} this task. Please try again.`,
              )}
            </div>
          ) : null}

          <div className="space-y-5">
            <InputField
              autoFocus
              disabled={saveMutation.isPending}
              error={errors.title?.message}
              id="task-title"
              label="Task title"
              maxLength={120}
              placeholder="e.g. Prepare the project presentation"
              {...register('title')}
            />

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  className="text-sm font-bold text-slate-700"
                  htmlFor="task-description"
                >
                  Description
                </label>
                <span className="text-xs font-semibold text-slate-400">
                  {description.length}/2000
                </span>
              </div>
              <textarea
                aria-describedby={
                  errors.description ? 'task-description-error' : undefined
                }
                aria-invalid={Boolean(errors.description)}
                className={`min-h-28 w-full resize-y rounded-xl border bg-white px-4 py-3 text-[0.95rem] leading-6 text-slate-950 transition outline-none placeholder:text-slate-400 ${
                  errors.description
                    ? 'border-rose-300 ring-4 ring-rose-100/70 focus:border-rose-400'
                    : 'border-slate-200 shadow-sm shadow-slate-950/[0.02] hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }`}
                disabled={saveMutation.isPending}
                id="task-description"
                maxLength={2000}
                placeholder="Add enough context to make the next step obvious..."
                {...register('description')}
              />
              {errors.description ? (
                <p
                  className="mt-1.5 text-sm font-medium text-rose-600"
                  id="task-description-error"
                >
                  {errors.description.message}
                </p>
              ) : null}
            </div>

            <RadioGroup
              disabled={saveMutation.isPending}
              error={errors.status?.message}
              legend="Status"
              name="status"
              options={statusOptions}
              register={register}
            />

            <RadioGroup
              disabled={saveMutation.isPending}
              error={errors.priority?.message}
              legend="Priority"
              name="priority"
              options={priorityOptions}
              register={register}
            />

            <InputField
              disabled={saveMutation.isPending}
              error={errors.dueDate?.message}
              icon={<CalendarClock aria-hidden="true" size={18} />}
              id="task-due-date"
              label="Due date"
              type="datetime-local"
              {...register('dueDate')}
            />

            {!task ? (
              <TaskAttachmentPicker
                disabled={saveMutation.isPending}
                error={attachmentError}
                files={attachmentFiles}
                onFileRemoved={(file) => {
                  setAttachmentFiles((currentFiles) =>
                    currentFiles.filter((currentFile) => currentFile !== file),
                  );
                  setAttachmentError(null);
                }}
                onFilesAdded={addAttachmentFiles}
              />
            ) : null}
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-950 focus-visible:ring-4 focus-visible:ring-slate-500/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saveMutation.isPending}
            onClick={requestClose}
            type="button"
          >
            Cancel
          </button>
          <Button
            className="sm:min-w-36"
            isLoading={saveMutation.isPending}
            loadingLabel={
              task
                ? 'Saving changes'
                : attachmentFiles.length > 0
                  ? 'Creating and uploading'
                  : 'Creating task'
            }
            type="submit"
          >
            {task ? (
              <Check aria-hidden="true" size={18} />
            ) : (
              <Plus aria-hidden="true" size={18} />
            )}
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}

interface RadioGroupProps<T extends 'status' | 'priority'> {
  legend: string;
  name: T;
  options: RadioOption<TaskFormValues[T]>[];
  error: string | undefined;
  disabled: boolean;
  register: UseFormRegister<TaskFormValues>;
}

function RadioGroup<T extends 'status' | 'priority'>({
  disabled,
  error,
  legend,
  name,
  options,
  register,
}: RadioGroupProps<T>) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-slate-700">
        {legend}
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {options.map(
          ({
            description: optionDescription,
            icon: Icon,
            label,
            selectedClassName,
            value,
          }) => (
            <label className="cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                disabled={disabled}
                type="radio"
                value={value}
                {...register(name)}
              />
              <span
                className={`flex min-h-16 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 transition peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/10 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 hover:border-slate-300 hover:bg-slate-50 ${selectedClassName}`}
              >
                <Icon aria-hidden="true" className="shrink-0" size={17} />
                <span>
                  <span className="block text-xs font-extrabold">{label}</span>
                  <span className="mt-0.5 block text-[0.68rem] opacity-70">
                    {optionDescription}
                  </span>
                </span>
              </span>
            </label>
          ),
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-sm font-medium text-rose-600">{error}</p>
      ) : null}
    </fieldset>
  );
}
