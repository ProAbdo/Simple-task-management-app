export function TaskListSkeleton() {
  return (
    <div aria-label="Loading tasks" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="h-28 animate-pulse rounded-2xl border border-slate-200/60 bg-white/75"
            key={index}
          >
            <span className="sr-only">Loading task summary</span>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="h-[250px] animate-pulse rounded-2xl border border-slate-200/60 bg-white/75 p-6"
            key={index}
          >
            <div className="h-6 w-28 rounded-full bg-slate-100" />
            <div className="mt-6 h-5 w-3/4 rounded bg-slate-100" />
            <div className="mt-3 h-4 w-full rounded bg-slate-100" />
            <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
            <div className="mt-8 h-px bg-slate-100" />
            <div className="mt-4 h-4 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
