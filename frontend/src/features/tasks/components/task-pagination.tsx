import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

import type { TaskPagination as TaskPaginationData } from '@/features/tasks/task.types';

interface TaskPaginationProps {
  pagination: TaskPaginationData;
  onPageChange: (page: number) => void;
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const lastPage = Math.min(totalPages, firstPage + 4);

  return Array.from(
    { length: lastPage - firstPage + 1 },
    (_, index) => firstPage + index,
  );
}

export function TaskPagination({
  onPageChange,
  pagination,
}: TaskPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const firstItem = (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems,
  );

  return (
    <nav
      aria-label="Task pages"
      className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm sm:flex-row"
    >
      <p className="text-sm font-semibold text-slate-500">
        Showing{' '}
        <span className="font-extrabold text-slate-900">{firstItem}</span>
        {'–'}
        <span className="font-extrabold text-slate-900">
          {lastItem}
        </span> of{' '}
        <span className="font-extrabold text-slate-900">
          {pagination.totalItems}
        </span>
      </p>

      <div className="flex items-center gap-1.5">
        <PageButton
          disabled={!pagination.hasPreviousPage}
          label="Previous page"
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft aria-hidden="true" size={17} />
        </PageButton>

        {getVisiblePages(pagination.page, pagination.totalPages).map((page) => (
          <PageButton
            isCurrent={page === pagination.page}
            key={page}
            label={`Page ${page}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PageButton>
        ))}

        <PageButton
          disabled={!pagination.hasNextPage}
          label="Next page"
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <ChevronRight aria-hidden="true" size={17} />
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({
  children,
  disabled = false,
  isCurrent = false,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  isCurrent?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-current={isCurrent ? 'page' : undefined}
      aria-label={label}
      className={`grid min-h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-extrabold transition focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 ${
        isCurrent
          ? 'bg-slate-950 text-white shadow-md shadow-slate-950/15'
          : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
