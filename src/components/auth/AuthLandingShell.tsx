'use client';

import Link from 'next/link';
import { ArrowRight, Bot, Calendar, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { AuthRouteBody } from '@/components/auth/AuthRouteBody';

const features = [
  {
    icon: FileSearch,
    title: 'Source-grounded drafts',
    description: 'RAG from Knowledge Base, Drive, and official links before any post is written.',
    chip: 'RAG / AI',
  },
  {
    icon: ShieldCheck,
    title: 'Review before publish',
    description: 'Human approval, compliance checks, and audit logs on every content job.',
    chip: 'Compliance',
  },
  {
    icon: Calendar,
    title: 'Schedule to channels',
    description: 'Facebook Pages and publishing queue with live status tracking.',
    chip: 'Publishing',
  },
];

type AuthLandingShellProps = {
  product: 'prd' | 'publisher';
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLandingShell({ product, title, subtitle, children }: AuthLandingShellProps) {
  const isPrd = product === 'prd';

  return (
    <AuthRouteBody variant="prd">
    <div className="obsidian-flux relative min-h-dvh overflow-y-auto flux-glow-ambient">
      <div className="pointer-events-none absolute inset-0 flux-grid-bg opacity-60" aria-hidden />

      <div className="relative mx-auto grid min-h-dvh max-w-[var(--flux-container-max)] lg:grid-cols-[minmax(0,1.1fr)_minmax(400px,0.9fr)]">
        <section className="relative flex flex-col justify-between px-[var(--flux-gutter)] py-10 sm:py-12 lg:px-12 lg:py-14">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flux-glass flex h-11 w-11 items-center justify-center rounded-[var(--flux-radius-lg)]">
                <Sparkles className="h-5 w-5 text-[var(--flux-primary)]" />
              </div>
              <div>
                <p className="flux-label-caps text-[var(--flux-secondary)]">Obsidian Flux</p>
                <p className="text-sm font-semibold text-[var(--flux-on-surface)]">
                  {isPrd ? 'Head Office PRD' : 'Content OS Publisher'}
                </p>
              </div>
            </div>

            <div className="mt-[var(--flux-stack-xl)] max-w-xl">
              <span className="flux-chip flux-chip-primary inline-flex items-center gap-2">
                <Bot className="h-3.5 w-3.5" />
                Agent-assisted workflow
              </span>

              <h1 className="flux-display-lg mt-6 text-[var(--flux-on-surface)]">
                สร้างคอนเทนต์มืออาชีพ
                <span className="mt-3 block bg-gradient-to-r from-[var(--flux-primary)] to-[var(--flux-secondary)] bg-clip-text text-transparent">
                  with review, RAG, and publishing in one place
                </span>
              </h1>

              <p className="flux-body-base mt-4 max-w-lg text-[var(--flux-on-surface-variant)]">
                จาก brief → draft → ตรวจสอบ → อนุมัติ → schedule ไป Facebook และช่องทางอื่น พร้อม audit trail ทุกขั้นตอน
              </p>

              <div className="mt-3 h-1 w-32 overflow-hidden rounded-full bg-[var(--flux-surface-container-high)]">
                <div className="flux-progress-shimmer h-full w-full rounded-full" />
              </div>
            </div>

            <div className="mt-8 grid gap-[var(--flux-stack-md)] sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flux-glass rounded-[var(--flux-radius-lg)] p-4">
                    <span className="flux-code-sm flux-chip flux-chip-primary">{feature.chip}</span>
                    <div className="mt-3 flex h-9 w-9 items-center justify-center rounded-[var(--flux-radius)] border border-white/10 bg-white/5">
                      <Icon className="h-4 w-4 text-[var(--flux-secondary)]" />
                    </div>
                    <h2 className="mt-3 text-sm font-semibold text-[var(--flux-on-surface)]">{feature.title}</h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--flux-on-surface-variant)]">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex flex-wrap gap-2">
              {['Create Post', 'Review Queue', 'Publishing', 'Integrations'].map((item) => (
                <span key={item} className="flux-chip">
                  {item}
                </span>
              ))}
            </div>
            <Link className="flux-link inline-flex items-center gap-1.5 text-xs" href={isPrd ? '/publisher/login' : '/login'}>
              {isPrd ? 'Open Publisher login' : 'Open PRD login'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section className="flex items-center justify-center border-t border-white/10 px-[var(--flux-gutter)] py-10 lg:border-t-0 lg:border-l lg:py-14">
          <div className="w-full max-w-[440px]">
            <div className="mb-6 lg:hidden">
              <p className="flux-label-caps text-[var(--flux-outline)]">Head Office</p>
              <h2 className="flux-headline-md mt-2 text-[var(--flux-on-surface)]">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--flux-on-surface-variant)]">{subtitle}</p>
            </div>

            <div className="flux-glass-elevated rounded-[var(--flux-radius-xl)] p-6 sm:p-8">
              <div className="mb-6 hidden lg:block">
                <p className="flux-label-caps text-[var(--flux-outline)]">Secure access</p>
                <h2 className="flux-headline-md mt-2 text-[var(--flux-on-surface)]">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--flux-on-surface-variant)]">{subtitle}</p>
              </div>
              {children}
            </div>

            <p className="mt-5 text-center text-xs text-[var(--flux-on-surface-variant)]">
              {isPrd ? (
                <>
                  Need the publishing pipeline?{' '}
                  <Link className="flux-link" href="/publisher/login">
                    Sign in to Content OS
                  </Link>
                </>
              ) : (
                <>
                  Strategy &amp; dashboard?{' '}
                  <Link className="flux-link" href="/login">
                    Sign in to PRD
                  </Link>
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    </div>
    </AuthRouteBody>
  );
}
