import {
  ChevronDown,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { TaskPriority, TaskStatus } from '@/features/tasks/task.enums';

interface TaskFiltersProps {
  searchValue: string;
  status: TaskStatus | undefined;
  priority: TaskPriority | undefined;
  hasActiveFilters: boolean;
  isFetching: boolean;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onStatusChange: (value: TaskStatus | undefined) => void;
  onPriorityChange: (value: TaskPriority | undefined) => void;
  onClearAll: () => void;
}

const selectClassName =
  'h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm font-bold text-slate-700 outline-none transition hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10';

export function TaskFilters({
  hasActiveFilters,
  isFetching,
  onClearAll,
  onClearSearch,
  onPriorityChange,
  onSearchChange,
  onStatusChange,
  priority,
  searchValue,
  status,
}: TaskFiltersProps) {
  return (
    <section
      aria-label="Search and filter tasks"
      className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-950/[0.025] sm:p-4"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            aria-label="Search tasks by title"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-11 text-sm font-semibold text-slate-950 transition outline-none placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            maxLength={120}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks by title..."
            type="search"
            value={searchValue}
          />
          {searchValue ? (
            <button
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none"
              onClick={onClearSearch}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          ) : isFetching ? (
            <LoaderCircle
              aria-label="Updating tasks"
              className="absolute top-1/2 right-3.5 -translate-y-1/2 animate-spin text-indigo-500"
              size={17}
            />
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-[390px]">
          <label className="relative">
            <span className="sr-only">Filter by status</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                onStatusChange(
                  event.target.value
                    ? (event.target.value as TaskStatus)
                    : undefined,
                )
              }
              value={status ?? ''}
            >
              <option value="">All statuses</option>
              <option value={TaskStatus.Todo}>To do</option>
              <option value={TaskStatus.InProgress}>In progress</option>
              <option value={TaskStatus.Done}>Done</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
              size={16}
            />
          </label>

          <label className="relative">
            <span className="sr-only">Filter by priority</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                onPriorityChange(
                  event.target.value
                    ? (event.target.value as TaskPriority)
                    : undefined,
                )
              }
              value={priority ?? ''}
            >
              <option value="">All priorities</option>
              <option value={TaskPriority.High}>High priority</option>
              <option value={TaskPriority.Medium}>Medium priority</option>
              <option value={TaskPriority.Low}>Low priority</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
              size={16}
            />
          </label>
        </div>

        {hasActiveFilters ? (
          <button
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none"
            onClick={onClearAll}
            type="button"
          >
            <SlidersHorizontal aria-hidden="true" size={16} />
            Clear all
          </button>
        ) : null}
      </div>
    </section>
  );
}
