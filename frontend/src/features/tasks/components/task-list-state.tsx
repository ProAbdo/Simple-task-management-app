import {
  ClipboardCheck,
  Plus,
  RefreshCw,
  SearchX,
  WifiOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface TaskListErrorProps {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export function TaskListError({
  isRetrying,
  message,
  onRetry,
}: TaskListErrorProps) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white px-6 py-14 text-center shadow-xl shadow-slate-950/[0.035]">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
        <WifiOff aria-hidden="true" size={25} />
      </span>
      <h2 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
        We couldn&apos;t load your tasks
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>
      <Button
        className="mt-6 min-h-11"
        isLoading={isRetrying}
        loadingLabel="Trying again"
        onClick={onRetry}
      >
        <RefreshCw aria-hidden="true" size={17} />
        Try again
      </Button>
    </div>
  );
}

interface TaskListEmptyProps {
  onCreateTask: () => void;
}

export function TaskListEmpty({ onCreateTask }: TaskListEmptyProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white px-6 py-16 text-center shadow-xl shadow-indigo-950/[0.04]">
      <div
        className="absolute top-1/2 left-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/60 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-950 text-indigo-300 shadow-2xl shadow-slate-950/20">
          <ClipboardCheck aria-hidden="true" size={29} />
        </span>
        <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
          A fresh space for focused work
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          You have no tasks yet. Capture your first priority and turn this fresh
          space into visible progress.
        </p>
        <Button className="mt-6" onClick={onCreateTask}>
          <Plus aria-hidden="true" size={18} />
          Create your first task
        </Button>
      </div>
    </div>
  );
}

interface TaskListNoResultsProps {
  onClearFilters: () => void;
}

export function TaskListNoResults({ onClearFilters }: TaskListNoResultsProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-xl shadow-slate-950/[0.035]">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
        <SearchX aria-hidden="true" size={25} />
      </span>
      <h2 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
        No tasks match these filters
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Try another search or reset the filters to see your full workspace.
      </p>
      <button
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none"
        onClick={onClearFilters}
        type="button"
      >
        <RefreshCw aria-hidden="true" size={16} />
        Reset filters
      </button>
    </div>
  );
}
