import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Check,
  Circle,
  Clock3,
  FileText,
  Flag,
  LoaderCircle,
  Paperclip,
  Pencil,
  Sparkles,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { getApiErrorMessage, isUnauthorizedApiError } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth.context';
import { DeleteTaskDialog } from '@/features/tasks/components/delete-task-dialog';
import { TaskAttachmentsDialog } from '@/features/tasks/components/task-attachments-dialog';
import { TaskFeedbackToast } from '@/features/tasks/components/task-feedback-toast';
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog';
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TaskPriority,
  TaskStatus,
} from '@/features/tasks/task.enums';
import { getTask, updateTask } from '@/features/tasks/tasks.api';

interface StatusOption {
  value: TaskStatus;
  icon: LucideIcon;
  activeClassName: string;
}

interface TaskFeedback {
  message: string;
  description: string;
  variant: 'success' | 'error';
}

const statusOptions: StatusOption[] = [
  {
    value: TaskStatus.Todo,
    icon: Circle,
    activeClassName: 'border-slate-800 bg-slate-950 text-white',
  },
  {
    value: TaskStatus.InProgress,
    icon: Clock3,
    activeClassName: 'border-amber-300 bg-amber-50 text-amber-800',
  },
  {
    value: TaskStatus.Done,
    icon: Check,
    activeClassName: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  },
];

const statusBadgeClasses: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'bg-slate-100 text-slate-700',
  [TaskStatus.InProgress]: 'bg-amber-50 text-amber-700',
  [TaskStatus.Done]: 'bg-emerald-50 text-emerald-700',
};

const priorityBadgeClasses: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'bg-sky-50 text-sky-700',
  [TaskPriority.Medium]: 'bg-violet-50 text-violet-700',
  [TaskPriority.High]: 'bg-rose-50 text-rose-700',
};

const dateTimeFormatter = new Intl.DateTimeFormat('en', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const compactDateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskDetailsPage() {
  const { taskId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [feedback, setFeedback] = useState<TaskFeedback | null>(null);
  const [currentTime] = useState(() => Date.now());

  const taskQuery = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => getTask(taskId),
    retry: (failureCount, error) =>
      !isUnauthorizedApiError(error) && failureCount < 1,
  });

  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) => updateTask(taskId, { status }),
    onSuccess: async (updatedTask) => {
      queryClient.setQueryData(['tasks', taskId], updatedTask);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFeedback({
        message: 'Status updated',
        description: `${updatedTask.title} is now ${TASK_STATUS_LABELS[
          updatedTask.status
        ].toLowerCase()}.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      setFeedback({
        message: 'Status not updated',
        description: getApiErrorMessage(
          error,
          'We could not update this task. Please try again.',
        ),
        variant: 'error',
      });
    },
  });

  useEffect(() => {
    if (taskQuery.isError && isUnauthorizedApiError(taskQuery.error)) {
      signOut();
    }
  }, [signOut, taskQuery.error, taskQuery.isError]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), 4_000);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  if (taskQuery.isPending) {
    return <TaskDetailsSkeleton />;
  }

  if (taskQuery.isError) {
    return (
      <TaskDetailsError
        isRetrying={taskQuery.isFetching}
        message={getApiErrorMessage(
          taskQuery.error,
          'We could not load this task.',
        )}
        onRetry={() => {
          void taskQuery.refetch();
        }}
      />
    );
  }

  const task = taskQuery.data;
  const isOverdue =
    task.status !== TaskStatus.Done &&
    new Date(task.dueDate).getTime() < currentTime;

  return (
    <div className="animate-auth-enter">
      <Link
        className="inline-flex items-center gap-2 rounded-lg text-sm font-extrabold text-slate-500 transition hover:text-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none"
        to="/app"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Back to task board
      </Link>

      <article className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-xl shadow-slate-950/[0.045]">
        <header className="relative overflow-hidden border-b border-slate-100 px-5 py-7 sm:px-8 sm:py-9">
          <div
            aria-hidden="true"
            className="absolute -top-32 right-0 size-80 rounded-full bg-indigo-100/80 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-cyan-100/60 blur-3xl"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${statusBadgeClasses[task.status]}`}
              >
                <Sparkles aria-hidden="true" size={13} />
                {TASK_STATUS_LABELS[task.status]}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${priorityBadgeClasses[task.priority]}`}
              >
                <Flag aria-hidden="true" size={13} />
                {TASK_PRIORITY_LABELS[task.priority]} priority
              </span>
              {isOverdue ? (
                <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700">
                  Overdue
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-extrabold tracking-[0.14em] text-indigo-600 uppercase">
                  Task details
                </p>
                <h1 className="mt-2 text-3xl leading-tight font-extrabold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                  {task.title}
                </h1>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => setIsEditOpen(true)}>
                  <Pencil aria-hidden="true" size={17} />
                  Edit task
                </Button>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 text-sm font-extrabold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:ring-4 focus-visible:ring-rose-500/10 focus-visible:outline-none"
                  onClick={() => setIsDeleteOpen(true)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={17} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <section aria-labelledby="task-description-heading">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-xs font-extrabold tracking-[0.1em] text-slate-400 uppercase">
                    Context
                  </p>
                  <h2
                    className="text-lg font-extrabold text-slate-900"
                    id="task-description-heading"
                  >
                    Description
                  </h2>
                </div>
              </div>
              <p className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 text-[0.95rem] leading-7 break-words whitespace-pre-wrap text-slate-600">
                {task.description}
              </p>
            </section>

            <section aria-labelledby="task-attachments-heading">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                    <Paperclip aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold tracking-[0.1em] text-slate-400 uppercase">
                      Files
                    </p>
                    <h2
                      className="text-lg font-extrabold text-slate-900"
                      id="task-attachments-heading"
                    >
                      Attachments
                    </h2>
                  </div>
                </div>
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none"
                  onClick={() => setIsAttachmentsOpen(true)}
                  type="button"
                >
                  Manage files
                </button>
              </div>

              {task.attachments.length === 0 ? (
                <button
                  className="mt-4 grid w-full place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none"
                  onClick={() => setIsAttachmentsOpen(true)}
                  type="button"
                >
                  <Paperclip
                    aria-hidden="true"
                    className="text-slate-300"
                    size={23}
                  />
                  <span className="mt-2 text-sm font-extrabold text-slate-600">
                    No attachments yet
                  </span>
                  <span className="mt-1 text-xs font-semibold text-slate-400">
                    Add supporting files to this task
                  </span>
                </button>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {task.attachments.map((attachment) => (
                    <li
                      className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
                      key={attachment.id}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FileText aria-hidden="true" size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-extrabold text-slate-800">
                          {attachment.fileName}
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-slate-400">
                          {formatFileSize(attachment.size)} ·{' '}
                          {compactDateFormatter.format(
                            new Date(attachment.uploadedAt),
                          )}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <h2 className="text-sm font-extrabold text-slate-900">
                Move task
              </h2>
              <p className="mt-1 text-xs leading-5 font-semibold text-slate-400">
                Change its workflow status without leaving this page.
              </p>
              <div className="mt-4 space-y-2">
                {statusOptions.map(({ activeClassName, icon: Icon, value }) => {
                  const isActive = task.status === value;
                  const isUpdating =
                    statusMutation.isPending &&
                    statusMutation.variables === value;

                  return (
                    <button
                      aria-pressed={isActive}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3.5 text-sm font-extrabold transition focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none disabled:cursor-wait ${
                        isActive
                          ? activeClassName
                          : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-700'
                      }`}
                      disabled={isActive || statusMutation.isPending}
                      key={value}
                      onClick={() => statusMutation.mutate(value)}
                      type="button"
                    >
                      {isUpdating ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="animate-spin"
                          size={16}
                        />
                      ) : (
                        <Icon aria-hidden="true" size={16} />
                      )}
                      {TASK_STATUS_LABELS[value]}
                      {isActive ? (
                        <Check
                          aria-hidden="true"
                          className="ml-auto"
                          size={15}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900">
                Timeline
              </h2>
              <dl className="mt-4 space-y-4">
                <DetailItem
                  icon={CalendarClock}
                  label="Due date"
                  tone={isOverdue ? 'text-rose-600' : 'text-slate-700'}
                  value={dateTimeFormatter.format(new Date(task.dueDate))}
                />
                <DetailItem
                  icon={Sparkles}
                  label="Created"
                  value={dateTimeFormatter.format(new Date(task.createdAt))}
                />
                <DetailItem
                  icon={Clock3}
                  label="Last updated"
                  value={dateTimeFormatter.format(new Date(task.updatedAt))}
                />
              </dl>
            </section>
          </aside>
        </div>
      </article>

      <TaskFormDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={(savedTask) => {
          queryClient.setQueryData(['tasks', taskId], savedTask);
          setFeedback({
            message: 'Changes saved',
            description: savedTask.title,
            variant: 'success',
          });
        }}
        task={task}
      />
      {isDeleteOpen ? (
        <DeleteTaskDialog
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={() => navigate('/app', { replace: true })}
          task={task}
        />
      ) : null}
      {isAttachmentsOpen ? (
        <TaskAttachmentsDialog
          onClose={() => setIsAttachmentsOpen(false)}
          task={task}
        />
      ) : null}
      {feedback ? (
        <TaskFeedbackToast
          description={feedback.description}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
          variant={feedback.variant}
        />
      ) : null}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  tone = 'text-slate-700',
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone?: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Icon aria-hidden="true" size={15} />
      </span>
      <div>
        <dt className="text-[0.68rem] font-extrabold tracking-[0.08em] text-slate-400 uppercase">
          {label}
        </dt>
        <dd className={`mt-0.5 text-xs leading-5 font-bold ${tone}`}>
          {value}
        </dd>
      </div>
    </div>
  );
}

function TaskDetailsSkeleton() {
  return (
    <div aria-label="Loading task details" className="animate-pulse">
      <div className="h-5 w-32 rounded bg-slate-200" />
      <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-8 py-9">
          <div className="h-6 w-40 rounded-full bg-slate-200" />
          <div className="mt-5 h-12 max-w-2xl rounded-xl bg-slate-200" />
        </div>
        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="h-7 w-36 rounded bg-slate-200" />
            <div className="mt-4 h-48 rounded-2xl bg-slate-100" />
          </div>
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function TaskDetailsError({
  isRetrying,
  message,
  onRetry,
}: {
  isRetrying: boolean;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle aria-hidden="true" size={25} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
        Task unavailable
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          to="/app"
        >
          Back to task board
        </Link>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-extrabold text-white disabled:opacity-60"
          disabled={isRetrying}
          onClick={onRetry}
          type="button"
        >
          {isRetrying ? 'Trying again...' : 'Try again'}
        </button>
      </div>
    </div>
  );
}
