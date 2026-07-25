import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, Trash2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { getApiErrorMessage } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import type { Task } from '@/features/tasks/task.types';
import { deleteTask } from '@/features/tasks/tasks.api';

interface DeleteTaskDialogProps {
  task: Task;
  onClose: () => void;
  onDeleted: (task: Task) => void;
}

export function DeleteTaskDialog({
  onClose,
  onDeleted,
  task,
}: DeleteTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onDeleted(task);
      onClose();
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    dialog.showModal();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  const requestClose = () => {
    if (!deleteMutation.isPending) {
      onClose();
    }
  };

  return (
    <dialog
      aria-labelledby="delete-task-title"
      className="task-dialog m-auto w-[calc(100%-1.5rem)] max-w-md overflow-hidden rounded-[1.75rem] border-0 bg-white p-0 text-slate-950 shadow-2xl shadow-slate-950/25"
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
      <div className="relative overflow-hidden px-5 pt-6 pb-5 sm:px-7 sm:pt-7">
        <div
          className="absolute -top-20 -right-12 size-48 rounded-full bg-rose-100/80 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle aria-hidden="true" size={23} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold tracking-[0.12em] text-rose-600 uppercase">
              Delete task
            </p>
            <h2
              className="mt-1 text-2xl font-extrabold tracking-[-0.04em]"
              id="delete-task-title"
            >
              Remove this task?
            </h2>
          </div>
          <button
            aria-label="Close delete task dialog"
            className="ml-auto grid size-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-rose-500/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={deleteMutation.isPending}
            onClick={requestClose}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        <p className="relative mt-5 text-sm leading-6 text-slate-500">
          This will permanently remove the task and cannot be undone.
        </p>
        <div className="relative mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-extrabold break-words text-slate-800">
            {task.title}
          </p>
        </div>

        {deleteMutation.isError ? (
          <div
            className="relative mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700"
            role="alert"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={18}
            />
            {getApiErrorMessage(
              deleteMutation.error,
              'We could not delete this task. Please try again.',
            )}
          </div>
        ) : null}
      </div>

      <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
        <button
          autoFocus
          className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-950 focus-visible:ring-4 focus-visible:ring-slate-500/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={deleteMutation.isPending}
          onClick={requestClose}
          type="button"
        >
          Keep task
        </button>
        <Button
          isLoading={deleteMutation.isPending}
          loadingLabel="Deleting task"
          onClick={() => deleteMutation.mutate()}
          variant="danger"
        >
          <Trash2 aria-hidden="true" size={18} />
          Delete permanently
        </Button>
      </footer>
    </dialog>
  );
}
