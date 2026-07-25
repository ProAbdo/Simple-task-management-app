import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  CheckCircle2,
  CircleDot,
  ListTodo,
  Plus,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getApiErrorMessage, isUnauthorizedApiError } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth.context';
import { DeleteTaskDialog } from '@/features/tasks/components/delete-task-dialog';
import { TaskAttachmentsDialog } from '@/features/tasks/components/task-attachments-dialog';
import { TaskBoard } from '@/features/tasks/components/task-board';
import { TaskFeedbackToast } from '@/features/tasks/components/task-feedback-toast';
import { TaskFilters } from '@/features/tasks/components/task-filters';
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog';
import { TaskListSkeleton } from '@/features/tasks/components/task-list-skeleton';
import {
  TaskListEmpty,
  TaskListError,
  TaskListNoResults,
} from '@/features/tasks/components/task-list-state';
import { TaskPagination } from '@/features/tasks/components/task-pagination';
import {
  TASK_PRIORITY_VALUES,
  TASK_STATUS_LABELS,
  TASK_STATUS_VALUES,
  TaskPriority,
  TaskStatus,
} from '@/features/tasks/task.enums';
import type {
  Task,
  TaskFilters as TaskFilterValues,
  TaskPagination as TaskPaginationData,
} from '@/features/tasks/task.types';
import { listTasks, updateTask } from '@/features/tasks/tasks.api';

type FilterName = 'search' | 'status' | 'priority' | 'page';

const TASKS_PER_PAGE = 9;

interface TaskFeedback {
  message: string;
  description: string;
  variant: 'success' | 'error';
}

function parseTaskStatus(value: string | null): TaskStatus | undefined {
  return value && TASK_STATUS_VALUES.includes(value as TaskStatus)
    ? (value as TaskStatus)
    : undefined;
}

function parseTaskPriority(value: string | null): TaskPriority | undefined {
  return value && TASK_PRIORITY_VALUES.includes(value as TaskPriority)
    ? (value as TaskPriority)
    : undefined;
}

function parsePage(value: string | null): number {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function TaskListPage() {
  const { session, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedSearch = (searchParams.get('search') ?? '').trim().slice(0, 120);
  const status = parseTaskStatus(searchParams.get('status'));
  const priority = parseTaskPriority(searchParams.get('priority'));
  const page = parsePage(searchParams.get('page'));
  const [searchValue, setSearchValue] = useState(appliedSearch);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskForAttachments, setTaskForAttachments] = useState<Task | null>(
    null,
  );
  const [feedback, setFeedback] = useState<TaskFeedback | null>(null);

  const filters: TaskFilterValues = {
    ...(appliedSearch ? { search: appliedSearch } : {}),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    page,
    limit: TASKS_PER_PAGE,
  };
  const hasAppliedFilters = Boolean(appliedSearch || status || priority);
  const hasActiveControls = Boolean(searchValue.trim() || status || priority);

  const updateFilter = useCallback(
    (name: FilterName, value: string | undefined) => {
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);

          if (value) {
            nextParams.set(name, value);
          } else {
            nextParams.delete(name);
          }

          if (name !== 'page') {
            nextParams.delete('page');
          }

          return nextParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const normalizedSearch = searchValue.trim();

    if (normalizedSearch === appliedSearch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateFilter('search', normalizedSearch || undefined);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [appliedSearch, searchValue, updateFilter]);

  const tasksQuery = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => listTasks(filters),
    placeholderData: keepPreviousData,
    retry: (failureCount, error) =>
      !isUnauthorizedApiError(error) && failureCount < 1,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      task,
      status: nextStatus,
    }: {
      task: Task;
      status: TaskStatus;
    }) => updateTask(task.id, { status: nextStatus }),
    onSuccess: async (updatedTask) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFeedback({
        message: 'Status updated',
        description: `${updatedTask.title} is now ${TASK_STATUS_LABELS[updatedTask.status].toLowerCase()}.`,
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
    const totalPages = tasksQuery.data?.pagination.totalPages;

    if (totalPages === undefined) {
      return;
    }

    const lastAvailablePage = Math.max(1, totalPages);

    if (page > lastAvailablePage) {
      updateFilter(
        'page',
        lastAvailablePage === 1 ? undefined : lastAvailablePage.toString(),
      );
    }
  }, [page, tasksQuery.data?.pagination.totalPages, updateFilter]);

  useEffect(() => {
    if (tasksQuery.isError && isUnauthorizedApiError(tasksQuery.error)) {
      signOut();
    }
  }, [signOut, tasksQuery.error, tasksQuery.isError]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 4_000);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const clearSearch = () => {
    setSearchValue('');
    updateFilter('search', undefined);
  };

  const clearAllFilters = () => {
    setSearchValue('');
    setSearchParams({}, { replace: true });
  };

  const openCreateTask = () => {
    setTaskToEdit(null);
    setIsTaskFormOpen(true);
  };

  const openEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  return (
    <div className="animate-auth-enter">
      <PageIntroduction
        name={session?.user.name}
        onCreateTask={openCreateTask}
      />
      <TaskFilters
        hasActiveFilters={hasActiveControls}
        isFetching={tasksQuery.isFetching && !tasksQuery.isPending}
        onClearAll={clearAllFilters}
        onClearSearch={clearSearch}
        onPriorityChange={(value) => updateFilter('priority', value)}
        onSearchChange={setSearchValue}
        onStatusChange={(value) => updateFilter('status', value)}
        priority={priority}
        searchValue={searchValue}
        status={status}
      />

      <div className="mt-8">
        {tasksQuery.isPending ? (
          <TaskListSkeleton />
        ) : tasksQuery.isError ? (
          <TaskListError
            isRetrying={tasksQuery.isFetching}
            message={getApiErrorMessage(
              tasksQuery.error,
              'Something unexpected happened. Please try again.',
            )}
            onRetry={() => {
              void tasksQuery.refetch();
            }}
          />
        ) : tasksQuery.data.tasks.length === 0 ? (
          hasAppliedFilters ? (
            <TaskListNoResults onClearFilters={clearAllFilters} />
          ) : (
            <TaskListEmpty onCreateTask={openCreateTask} />
          )
        ) : (
          <TaskResults
            isFiltered={hasAppliedFilters}
            isStatusUpdatePending={statusMutation.isPending}
            onAttachments={setTaskForAttachments}
            onDeleteTask={setTaskToDelete}
            onEditTask={openEditTask}
            onPageChange={(nextPage) =>
              updateFilter(
                'page',
                nextPage === 1 ? undefined : nextPage.toString(),
              )
            }
            onStatusChange={(task, nextStatus) => {
              statusMutation.mutate({ task, status: nextStatus });
            }}
            pagination={tasksQuery.data.pagination}
            statusUpdatingTaskId={statusMutation.variables?.task.id}
            tasks={tasksQuery.data.tasks}
          />
        )}
      </div>

      <TaskFormDialog
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSaved={(task, action, failedAttachmentCount) => {
          if (action === 'created') {
            updateFilter('page', undefined);
          }

          if (failedAttachmentCount > 0) {
            setFeedback({
              message: 'Task created, some files failed',
              description: `${failedAttachmentCount} ${
                failedAttachmentCount === 1 ? 'attachment' : 'attachments'
              } could not be uploaded. Use the paperclip action to try again.`,
              variant: 'error',
            });
            return;
          }

          setFeedback({
            message: action === 'created' ? 'Task created' : 'Changes saved',
            description: task.title,
            variant: 'success',
          });
        }}
        task={taskToEdit}
      />
      {taskToDelete ? (
        <DeleteTaskDialog
          onClose={() => setTaskToDelete(null)}
          onDeleted={(task) => {
            setFeedback({
              message: 'Task deleted',
              description: task.title,
              variant: 'success',
            });
          }}
          task={taskToDelete}
        />
      ) : null}
      {taskForAttachments ? (
        <TaskAttachmentsDialog
          onClose={() => setTaskForAttachments(null)}
          task={taskForAttachments}
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

interface SummaryItem {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
  valueClassName: string;
}

function TaskResults({
  isFiltered,
  isStatusUpdatePending,
  onAttachments,
  onDeleteTask,
  onEditTask,
  onPageChange,
  onStatusChange,
  pagination,
  statusUpdatingTaskId,
  tasks,
}: {
  isFiltered: boolean;
  isStatusUpdatePending: boolean;
  onAttachments: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onPageChange: (page: number) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  pagination: TaskPaginationData;
  statusUpdatingTaskId: string | undefined;
  tasks: Task[];
}) {
  const inProgressCount = tasks.filter(
    (task) => task.status === TaskStatus.InProgress,
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === TaskStatus.Done,
  ).length;
  const completedPercentage = Math.round((completedCount / tasks.length) * 100);
  const summaryItems: SummaryItem[] = [
    {
      label: isFiltered ? 'Matching tasks' : 'Total tasks',
      value: pagination.totalItems,
      icon: ListTodo,
      iconClassName: 'bg-indigo-50 text-indigo-600',
      valueClassName: 'text-slate-950',
    },
    {
      label: 'In progress on page',
      value: inProgressCount,
      icon: CircleDot,
      iconClassName: 'bg-amber-50 text-amber-600',
      valueClassName: 'text-amber-600',
    },
    {
      label: 'Completed on page',
      value: completedCount,
      icon: CheckCircle2,
      iconClassName: 'bg-emerald-50 text-emerald-600',
      valueClassName: 'text-emerald-600',
    },
  ];

  return (
    <>
      <section aria-label="Task summary" className="grid gap-4 sm:grid-cols-3">
        {summaryItems.map(
          ({ icon: Icon, iconClassName, label, value, valueClassName }) => (
            <article
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-950/[0.025]"
              key={label}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`grid size-10 place-items-center rounded-xl ${iconClassName}`}
                >
                  <Icon aria-hidden="true" size={19} />
                </span>
                <span
                  className={`text-3xl font-extrabold tracking-[-0.05em] ${valueClassName}`}
                >
                  {value}
                </span>
              </div>
              <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
            </article>
          ),
        )}
      </section>

      <section className="mt-9" aria-labelledby="task-list-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              className="text-xl font-extrabold tracking-[-0.035em] text-slate-950"
              id="task-list-heading"
            >
              {isFiltered ? 'Matching tasks' : 'Your latest tasks'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {pagination.totalItems}{' '}
              {pagination.totalItems === 1 ? 'task' : 'tasks'}{' '}
              {isFiltered ? 'found' : 'in your workspace'} · page{' '}
              {pagination.page} of {pagination.totalPages}
            </p>
            <p className="mt-1 text-xs font-semibold text-indigo-500">
              Drag any card into another column to update its status.
            </p>
          </div>
          <div className="w-full max-w-[210px] sm:w-auto sm:min-w-[210px]">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Page progress</span>
              <span className="text-indigo-600">{completedPercentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-[width] duration-700"
                style={{ width: `${completedPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <TaskBoard
          isStatusUpdatePending={isStatusUpdatePending}
          onAttachments={onAttachments}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          onStatusChange={onStatusChange}
          statusUpdatingTaskId={statusUpdatingTaskId}
          tasks={tasks}
        />
        <TaskPagination onPageChange={onPageChange} pagination={pagination} />
      </section>
    </>
  );
}

function PageIntroduction({
  name,
  onCreateTask,
}: {
  name: string | undefined;
  onCreateTask: () => void;
}) {
  const firstName = name?.split(' ')[0] ?? 'there';

  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-indigo-600 uppercase">
          <Sparkles aria-hidden="true" size={15} />
          Personal workspace
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-5xl">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Everything that needs your attention, organized in one calm place.
        </p>
      </div>
      <Button
        className="w-full shadow-xl shadow-slate-950/10 sm:w-auto"
        onClick={onCreateTask}
      >
        <Plus aria-hidden="true" size={18} />
        New task
      </Button>
    </header>
  );
}
