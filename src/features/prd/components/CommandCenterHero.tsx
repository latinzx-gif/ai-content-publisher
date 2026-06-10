'use client';

import { Bot, ChevronRight, ShieldCheck, Zap } from 'lucide-react';

import type { CommandCenterCounts } from '@/features/prd/types/dashboard';

export type CommandCenterHeroProps = {
  counts: CommandCenterCounts;
  loading: boolean;
  error: string;
  onCreate: () => void;
  onReview: () => void;
  onDetails: () => void;
  onRunAgentQueue: () => void;
  isAgentRunning: boolean;
};

export function CommandCenterHero({
  counts,
  loading,
  error,
  onCreate,
  onReview,
  onDetails,
  onRunAgentQueue,
  isAgentRunning,
}: CommandCenterHeroProps) {
  const readiness = [
    { label: 'OpenAI', value: error.toLowerCase().includes('openai') ? 'Check' : 'Ready', tone: error.toLowerCase().includes('openai') ? 'rose' : 'emerald' },
    { label: 'Buffer', value: counts.failedPublish > 0 ? 'Needs action' : 'Ready to connect', tone: counts.failedPublish > 0 ? 'rose' : 'amber' },
    { label: 'Brand Rules', value: 'Ready', tone: 'emerald' },
    { label: 'Content Rules', value: 'Ready', tone: 'emerald' },
  ];
  const nextAction = error
    ? { title: 'System needs attention', detail: 'Review connection or token health before sending more work to agents.', action: 'View details', onClick: onDetails }
    : counts.failedPublish > 0
      ? { title: 'Resolve failed publishing', detail: `${counts.failedPublish} item(s) need retry, fallback, or platform attention.`, action: 'Open details', onClick: onDetails }
      : counts.review > 0
        ? { title: `Review ${counts.review} draft${counts.review > 1 ? 's' : ''}`, detail: 'Human approval is the main bottleneck before scheduling.', action: 'Open review', onClick: onReview }
        : { title: 'Create first batch', detail: 'Start a guided studio flow and let the agent workflow prepare text, image direction, QC, and review handoff.', action: 'Create batch', onClick: onCreate };
  const stuckWork = [
    { label: 'Drafts', value: counts.generate },
    { label: 'QC failed', value: counts.qcFailed },
    { label: 'Awaiting review', value: counts.review },
    { label: 'Scheduled', value: counts.schedule },
    { label: 'Failed publish', value: counts.failedPublish },
  ];

  return (
    <section className="rounded-[28px] border border-[#d7d3c6] bg-[#f7f2e8] p-4 shadow-[0_18px_45px_rgba(84,73,48,0.09)] lg:p-5">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[#dfd7c2] bg-[#fffaf0] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8ceb5] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a6a2f]">
                <Zap className="h-3.5 w-3.5" />
                Operations command
              </div>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.04em] text-[#171717] md:text-3xl">
                What needs attention today?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">
                One screen for system readiness, stuck work, agent progress, and the next human decision before content moves to publishing.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onRunAgentQueue}
                disabled={isAgentRunning}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#c7b98e] bg-white px-3 text-xs font-semibold text-[#625237] ${
                  isAgentRunning ? 'cursor-not-allowed opacity-70' : 'hover:bg-[#fbf7ed]'
                }`}
                type="button"
              >
                <Bot className="h-3.5 w-3.5" />
                {isAgentRunning ? 'Testing queue...' : 'Test agent workflow'}
              </button>
              <span className="rounded-full border border-[#d9d1bf] bg-white px-3 py-1 text-xs font-semibold text-[#625237]">
                {loading ? 'Syncing live data' : `${counts.total} active item${counts.total === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {readiness.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#e3dccd] bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a8e78]">{item.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.tone === 'emerald' ? 'bg-emerald-500' : item.tone === 'rose' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  />
                  <p className="text-sm font-semibold text-[#171717]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-5">
            {stuckWork.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#e5dfd1] bg-[#fbf7ed] px-3 py-3">
                <p className="text-xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</p>
                <p className="mt-1 text-[11px] font-medium text-[#746b59]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#d5ccb7] bg-[#252015] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d6c7a7]">
            <ShieldCheck className="h-4 w-4" />
            Next action
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">{nextAction.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#d7cfbd]">{nextAction.detail}</p>
          <button
            onClick={nextAction.onClick}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#f0c36a] px-4 text-sm font-semibold text-[#211a0e] shadow-[0_12px_24px_rgba(0,0,0,0.18)] hover:bg-[#f6d386]"
          >
            {nextAction.action}
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d6c7a7]">Human control point</p>
            <p className="mt-2 text-sm leading-relaxed text-[#efe8d6]">
              Agents can generate, compose, check, and queue work. Approval stays with the reviewer before anything goes live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
