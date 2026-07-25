import { CheckCheck } from 'lucide-react';

interface BrandMarkProps {
  appearance?: 'dark' | 'light';
}

export function BrandMark({ appearance = 'dark' }: BrandMarkProps) {
  const textColor = appearance === 'light' ? 'text-white' : 'text-slate-950';

  return (
    <div className="inline-flex items-center gap-3" aria-label="Taskflow">
      <span className="grid size-10 place-items-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
        <CheckCheck aria-hidden="true" size={21} strokeWidth={2.5} />
      </span>
      <span
        className={`text-lg font-extrabold tracking-[-0.03em] ${textColor}`}
      >
        Taskflow
      </span>
    </div>
  );
}
