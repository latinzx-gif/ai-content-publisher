'use client';

import type { AgentQueueJob } from '@/features/prd/types/dashboard';
import { formatAgentQueueTime } from '@/features/prd/lib/datetime';

export type AgentQueueCardProps = {
  job: AgentQueueJob;
};

export function AgentQueueCard({ job }: AgentQueueCardProps) {
  const createdAtLabel = formatAgentQueueTime(job.createdAt);
  const updatedAtLabel = formatAgentQueueTime(job.updatedAt);
  const statusStyles = {
    Done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Running: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#1f5eff]',
    Queued: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
    'Waiting review': 'border-amber-200 bg-amber-50 text-amber-700',
  }[job.status];

  return (
    <article className="rounded-2xl border border-[#deded8] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-[#deded8] bg-[#fbfbfa] px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{job.agent}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles}`}>{job.status}</span>
            {job.runMode ? <span className="rounded-full border border-[#cfd8ea] bg-[#f4f7fd] px-2 py-0.5 text-[10px] font-semibold text-[#2f4f7f]">{job.runMode}</span> : null}
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-snug text-[#171717]">{job.stage}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{job.detail}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-col text-[10px] text-[#6e6e68]">
        <span>สร้าง: {createdAtLabel}</span>
        <span>อัปเดต: {updatedAtLabel}</span>
        {job.handoffTarget ? <span>ส่งต่อ: {job.handoffTarget}</span> : null}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2 text-[11px]">
        <span className="font-semibold text-[#4f4f49]">{job.owner}</span>
        <span className="font-medium text-[#8a8a82]">{job.id}</span>
      </div>
    </article>
  );
}
