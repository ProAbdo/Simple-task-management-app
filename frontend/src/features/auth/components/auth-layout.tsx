import {
  ArrowUpRight,
  Check,
  Circle,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { BrandMark } from '@/components/common/brand-mark';

const benefits = [
  {
    icon: Zap,
    title: 'Move with clarity',
    description: 'See what matters now without the visual noise.',
  },
  {
    icon: ShieldCheck,
    title: 'Your work stays yours',
    description: 'A private workspace protected by secure authentication.',
  },
  {
    icon: Sparkles,
    title: 'Designed for momentum',
    description: 'A calm system that makes progress feel effortless.',
  },
];

export function AuthLayout() {
  return (
    <div className="auth-shell relative min-h-screen overflow-hidden bg-[#f6f7fb]">
      <div className="auth-orb auth-orb-top" aria-hidden="true" />
      <div className="auth-orb auth-orb-bottom" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.04fr_0.96fr]">
        <aside className="auth-panel relative m-4 hidden min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] bg-slate-950 p-12 text-white shadow-2xl shadow-slate-950/15 lg:flex lg:flex-col xl:p-16">
          <div
            className="auth-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div
            className="absolute -top-32 -right-24 size-96 rounded-full bg-indigo-500/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-36 -left-28 size-96 rounded-full bg-cyan-400/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <BrandMark appearance="light" />
          </div>

          <div className="relative z-10 my-auto max-w-xl py-12">
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-bold tracking-[0.12em] text-indigo-200 uppercase backdrop-blur">
              <Sparkles aria-hidden="true" size={14} />
              Thoughtful work, beautifully organized
            </span>
            <h1 className="max-w-lg text-5xl leading-[1.05] font-extrabold tracking-[-0.055em] text-balance xl:text-6xl">
              Plan clearly.
              <br />
              <span className="text-indigo-300">Finish calmly.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              Taskflow turns scattered work into a focused daily system, so
              priorities stay visible and progress feels natural.
            </p>

            <div className="mt-10 grid gap-4 xl:grid-cols-3">
              {benefits.map(({ description, icon: Icon, title }) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
                  key={title}
                >
                  <span className="mb-4 grid size-9 place-items-center rounded-xl bg-indigo-400/15 text-indigo-200">
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <h2 className="text-sm font-bold text-white">{title}</h2>
                  <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-slate-400 uppercase">
                  Today&apos;s focus
                </p>
                <p className="mt-1 text-lg font-bold">3 of 5 complete</p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                60% done
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300" />
            </div>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-black/15 p-3">
                <span className="grid size-7 place-items-center rounded-full bg-emerald-400 text-slate-950">
                  <Check aria-hidden="true" size={15} strokeWidth={3} />
                </span>
                <span className="text-sm font-semibold text-slate-300 line-through">
                  Review priorities
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-indigo-400/10 p-3">
                <Circle
                  aria-hidden="true"
                  className="text-indigo-300"
                  fill="currentColor"
                  size={11}
                />
                <span className="text-sm font-semibold text-white">
                  Ship the next milestone
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="ml-auto text-indigo-300"
                  size={16}
                />
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-[500px]">
            <div className="mb-10 flex justify-center lg:hidden">
              <BrandMark />
            </div>
            <Outlet />
            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Built for focused work. Protected by secure authentication.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
