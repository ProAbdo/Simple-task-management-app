import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: 'primary' | 'danger';
}

export function Button({
  children,
  className = '',
  disabled,
  isLoading = false,
  loadingLabel = 'Please wait',
  type,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const variantClassName =
    variant === 'danger'
      ? 'bg-rose-600 shadow-rose-600/15 hover:bg-rose-700 hover:shadow-rose-600/25 focus-visible:ring-rose-500/20'
      : 'bg-slate-950 shadow-slate-950/10 hover:bg-indigo-600 hover:shadow-indigo-500/20 focus-visible:ring-indigo-500/20';

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${variantClassName} ${className}`}
      disabled={disabled || isLoading}
      type={type ?? 'button'}
      {...props}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden="true" size={18} />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
