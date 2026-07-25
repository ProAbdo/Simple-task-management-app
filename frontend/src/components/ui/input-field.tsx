import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id'
> {
  id: string;
  label: string;
  error?: string | undefined;
  icon?: ReactNode;
  trailing?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    { className = '', error, icon, id, label, trailing, ...props },
    ref,
  ) {
    const descriptionId = error ? `${id}-error` : undefined;

    return (
      <div>
        <label
          className="mb-2 block text-sm font-bold text-slate-700"
          htmlFor={id}
        >
          {label}
        </label>
        <div className="relative">
          {icon ? (
            <span className="pointer-events-none absolute top-1/2 left-3.5 flex -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          ) : null}
          <input
            aria-describedby={descriptionId}
            aria-invalid={Boolean(error)}
            className={`h-13 w-full rounded-xl border bg-white px-4 text-[0.95rem] text-slate-950 transition outline-none placeholder:text-slate-400 ${
              icon ? 'pl-11' : ''
            } ${trailing ? 'pr-12' : ''} ${
              error
                ? 'border-rose-300 ring-4 ring-rose-100/70 focus:border-rose-400'
                : 'border-slate-200 shadow-sm shadow-slate-950/[0.02] hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
            } ${className}`}
            id={id}
            ref={ref}
            {...props}
          />
          {trailing ? (
            <span className="absolute top-1/2 right-2.5 flex -translate-y-1/2">
              {trailing}
            </span>
          ) : null}
        </div>
        {error ? (
          <p
            className="mt-1.5 text-sm font-medium text-rose-600"
            id={descriptionId}
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
