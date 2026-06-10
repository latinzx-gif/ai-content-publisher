'use client';

import { Clock3, Eye, FileText, PenLine, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';

import type { CommandCenterCounts } from '@/features/prd/types/dashboard';

export type WorkflowPipelineOverviewProps = {
  counts: CommandCenterCounts;
};

export function WorkflowPipelineOverview({ counts }: WorkflowPipelineOverviewProps) {
  const steps = [
    { label: 'Brief', value: counts.brief, icon: PenLine },
    { label: 'Rules', value: counts.rules, icon: FileText },
    { label: 'Generate', value: counts.generate, icon: Sparkles },
    { label: 'QC', value: counts.qc, icon: ShieldCheck },
    { label: 'Review', value: counts.review, icon: Eye },
    { label: 'Schedule', value: counts.schedule, icon: Clock3 },
    { label: 'Publish', value: counts.publish, icon: UploadCloud },
  ];

  return (
    <section className="mt-4 rounded-2xl border border-[#deded8] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-semibold text-[#171717]">Publishing pipeline overview</h2>
          <p className="mt-0.5 text-xs text-[#6e6e68]">Brief → Rules → Generate → QC → Review → Schedule → Publish</p>
        </div>
        <span className="rounded-full border border-[#deded8] bg-[#f4f4f2] px-2.5 py-1 text-[11px] font-semibold text-[#6e6e68]">
          Agent handoff map
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="rounded-2xl border border-[#e5e5df] bg-[#fbfbfa] p-3">
              <div className="flex items-center justify-between gap-2">
                <Icon className="h-4 w-4 text-[#7c6a45]" />
                <span className="text-lg font-semibold tracking-[-0.04em] text-[#171717]">{step.value}</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#484844]">{step.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
