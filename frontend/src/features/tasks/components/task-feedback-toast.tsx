import { AlertCircle, Check, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface TaskFeedbackToastProps {
  message: string;
  description: string;
  variant: 'success' | 'error';
  onDismiss: () => void;
}

export function TaskFeedbackToast({
  description,
  message,
  onDismiss,
  variant,
}: TaskFeedbackToastProps) {
  const isSuccess = variant === 'success';

  return createPortal(
    <div
      aria-live="polite"
      className={`animate-toast-enter fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl shadow-slate-950/15 sm:right-6 sm:bottom-6 ${
        isSuccess ? 'border-emerald-200' : 'border-rose-200'
      }`}
      role={isSuccess ? 'status' : 'alert'}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          isSuccess
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-600'
        }`}
      >
        {isSuccess ? (
          <Check aria-hidden="true" size={19} strokeWidth={3} />
        ) : (
          <AlertCircle aria-hidden="true" size={19} />
        )}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-extrabold text-slate-950">{message}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <button
        aria-label="Dismiss notification"
        className="ml-auto grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none"
        onClick={onDismiss}
        type="button"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>,
    document.body,
  );
}
