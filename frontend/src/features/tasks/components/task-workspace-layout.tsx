import {
  CalendarDays,
  CheckSquare2,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import { BrandMark } from '@/components/common/brand-mark';
import { useAuth } from '@/features/auth/auth.context';

const dateFormatter = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function TaskWorkspaceLayout() {
  const { session, signOut } = useAuth();
  const user = session?.user;

  return (
    <div className="workspace-shell min-h-screen bg-[#f6f7fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[270px] border-r border-slate-200/80 bg-white/90 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="px-2">
          <BrandMark />
        </div>

        <nav className="mt-10" aria-label="Workspace">
          <p className="px-3 text-[0.68rem] font-extrabold tracking-[0.14em] text-slate-400 uppercase">
            Workspace
          </p>
          <Link
            aria-current="page"
            className="mt-3 flex items-center gap-3 rounded-xl bg-slate-950 px-3.5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/10"
            to="/app"
          >
            <LayoutDashboard aria-hidden="true" size={19} />
            My tasks
            <span className="ml-auto size-1.5 rounded-full bg-indigo-400" />
          </Link>
        </nav>

        <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <CheckSquare2 aria-hidden="true" size={18} />
          </span>
          <p className="mt-4 text-sm font-extrabold text-slate-900">
            Make progress visible
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            A calm overview of everything that deserves your attention.
          </p>
        </div>

        <div className="mt-auto border-t border-slate-200 pt-5">
          <div className="flex min-w-0 items-center gap-3 px-1">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-sm font-extrabold text-indigo-700">
              {getInitials(user?.name ?? 'User')}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              aria-label="Sign out"
              className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-4 focus-visible:ring-rose-500/10 focus-visible:outline-none"
              onClick={signOut}
              type="button"
            >
              <LogOut aria-hidden="true" size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/75 bg-[#f6f7fb]/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
            <div className="lg:hidden">
              <BrandMark />
            </div>
            <div className="hidden items-center gap-2 text-sm font-semibold text-slate-500 lg:flex">
              <CalendarDays
                aria-hidden="true"
                className="text-indigo-500"
                size={17}
              />
              {dateFormatter.format(new Date())}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block lg:hidden">
                <p className="text-sm font-extrabold text-slate-900">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-100 text-sm font-extrabold text-indigo-700 lg:hidden">
                {getInitials(user?.name ?? 'User')}
              </span>
              <button
                className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-rose-600 hover:shadow-md focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:outline-none lg:hidden"
                aria-label="Sign out"
                onClick={signOut}
                type="button"
              >
                <LogOut aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
