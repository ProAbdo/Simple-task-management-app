import { useDraggable } from '@dnd-kit/core';
import {
  CalendarClock,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  Eye,
  GripVertical,
  LoaderCircle,
  Paperclip,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PointerEventHandler } from 'react';
import { Link } from 'react-router-dom';

import { TaskPriority, TaskStatus } from '@/features/tasks/task.enums';
import type { Task } from '@/features/tasks/task.types';

interface TaskCardProps {
  task: Task;
  isStatusDisabled: boolean;
  isUpdatingStatus: boolean;
  onAttachments: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

interface StatusStyle {
  icon: LucideIcon;
  className: string;
  iconClassName: string;
}

const statusStyles: Record<TaskStatus, StatusStyle> = {
  [TaskStatus.Todo]: {
    icon: Circle,
    className: 'bg-slate-100 text-slate-600',
    iconClassName: 'text-slate-400',
  },
  [TaskStatus.InProgress]: {
    icon: Clock3,
    className: 'bg-amber-50 text-amber-700',
    iconClassName: 'text-amber-500',
  },
  [TaskStatus.Done]: {
    icon: Check,
    className: 'bg-emerald-50 text-emerald-700',
    iconClassName: 'text-emerald-500',
  },
};

const priorityStyles: Record<
  TaskPriority,
  { label: string; className: string; dotClassName: string }
> = {
  [TaskPriority.Low]: {
    label: 'Low',
    className: 'bg-sky-50 text-sky-700',
    dotClassName: 'bg-sky-400',
  },
  [TaskPriority.Medium]: {
    label: 'Medium',
    className: 'bg-violet-50 text-violet-700',
    dotClassName: 'bg-violet-400',
  },
  [TaskPriority.High]: {
    label: 'High',
    className: 'bg-rose-50 text-rose-700',
    dotClassName: 'bg-rose-500',
  },
};

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function getDueDateTone(task: Task): string {
  if (task.status === TaskStatus.Done) {
    return 'text-emerald-600';
  }

  return new Date(task.dueDate).getTime() < Date.now()
    ? 'text-rose-600'
    : 'text-slate-500';
}

export function TaskCard({
  isStatusDisabled,
  isUpdatingStatus,
  onAttachments,
  onDelete,
  onEdit,
  onStatusChange,
  task,
}: TaskCardProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
  } = useDraggable({
    id: task.id,
    data: { task },
    disabled: isStatusDisabled,
  });
  const status = statusStyles[task.status];
  const priority = priorityStyles[task.priority];
  const StatusIcon = status.icon;
  const cardPointerDown = listeners?.onPointerDown as
    PointerEventHandler<HTMLElement> | undefined;

  return (
    <article
      className={`group relative cursor-grab touch-none overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-950/[0.025] transition-[border-color,box-shadow,opacity] duration-200 select-none hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/[0.06] active:cursor-grabbing ${
        isDragging ? 'z-50 opacity-70 shadow-2xl ring-2 ring-indigo-300' : ''
      }`}
      onPointerDown={cardPointerDown}
      ref={setNodeRef}
      style={
        transform
          ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            }
          : undefined
      }
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          task.priority === TaskPriority.High
            ? 'bg-rose-400'
            : task.priority === TaskPriority.Medium
              ? 'bg-violet-400'
              : 'bg-sky-400'
        }`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <label
          className={`relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold ${status.className}`}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <span className="sr-only">Update status for {task.title}</span>
          {isUpdatingStatus ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={13}
            />
          ) : (
            <StatusIcon
              aria-hidden="true"
              className={status.iconClassName}
              size={13}
              strokeWidth={2.5}
            />
          )}
          <select
            aria-label={`Update status for ${task.title}`}
            className="appearance-none bg-transparent pr-3 font-extrabold outline-none disabled:cursor-wait"
            disabled={isStatusDisabled}
            onChange={(event) =>
              onStatusChange(task, event.target.value as TaskStatus)
            }
            value={task.status}
          >
            <option value={TaskStatus.Todo}>To do</option>
            <option value={TaskStatus.InProgress}>In progress</option>
            <option value={TaskStatus.Done}>Done</option>
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-2"
            size={12}
          />
        </label>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold ${priority.className}`}
        >
          <span
            className={`size-1.5 rounded-full ${priority.dotClassName}`}
            aria-hidden="true"
          />
          {priority.label} priority
        </span>
        <div
          className="ml-auto flex items-center gap-1"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            aria-label={`Drag ${task.title} to another status`}
            className="grid size-8 touch-none place-items-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isStatusDisabled}
            ref={setActivatorNodeRef}
            type="button"
            {...listeners}
            {...attributes}
          >
            <GripVertical aria-hidden="true" size={15} />
          </button>
          <button
            aria-label={`Manage attachments for ${task.title}`}
            className="relative grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700 focus-visible:ring-4 focus-visible:ring-cyan-500/10 focus-visible:outline-none disabled:cursor-wait disabled:opacity-50"
            disabled={isStatusDisabled}
            onClick={() => onAttachments(task)}
            type="button"
          >
            <Paperclip aria-hidden="true" size={15} />
            {task.attachments.length > 0 ? (
              <span className="absolute -top-1 -right-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-indigo-600 px-1 text-[0.55rem] leading-none font-extrabold text-white">
                {task.attachments.length}
              </span>
            ) : null}
          </button>
          <button
            aria-label={`Edit ${task.title}`}
            className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none disabled:cursor-wait disabled:opacity-50"
            disabled={isStatusDisabled}
            onClick={() => onEdit(task)}
            type="button"
          >
            <Pencil aria-hidden="true" size={15} />
          </button>
          <button
            aria-label={`Delete ${task.title}`}
            className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-4 focus-visible:ring-rose-500/10 focus-visible:outline-none disabled:cursor-wait disabled:opacity-50"
            disabled={isStatusDisabled}
            onClick={() => onDelete(task)}
            type="button"
          >
            <Trash2 aria-hidden="true" size={15} />
          </button>
        </div>
      </div>

      <h3 className="mt-5 text-lg leading-7 font-extrabold tracking-[-0.025em] text-slate-950">
        <Link
          className="flex items-start justify-between gap-3 rounded-lg transition hover:text-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none"
          onPointerDown={(event) => event.stopPropagation()}
          to={`/app/tasks/${task.id}`}
        >
          <span>{task.title}</span>
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
        {task.description}
      </p>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div
          className={`flex min-w-0 items-center gap-2 text-xs font-bold ${getDueDateTone(task)}`}
        >
          <CalendarClock aria-hidden="true" size={15} />
          <time dateTime={task.dueDate}>
            Due {dateFormatter.format(new Date(task.dueDate))}
          </time>
        </div>
        <Link
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl bg-indigo-50 px-3 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-600 hover:text-white focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none"
          onPointerDown={(event) => event.stopPropagation()}
          to={`/app/tasks/${task.id}`}
        >
          <Eye aria-hidden="true" size={15} strokeWidth={2.5} />
          View details
        </Link>
      </div>
    </article>
  );
}
