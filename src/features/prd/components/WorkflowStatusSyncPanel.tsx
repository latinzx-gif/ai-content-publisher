'use client';

import { Tag } from '@/features/prd/components/primitives/Tag';
import type { WorkflowStatusSnapshot } from '@/features/prd/types/workflow-status';

export type WorkflowStatusSyncPanelProps = {
  snapshot: WorkflowStatusSnapshot;
};

export function WorkflowStatusSyncPanel({ snapshot }: WorkflowStatusSyncPanelProps) {
  const healthTone =
    snapshot.syncHealth === 'Synced'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : snapshot.syncHealth === 'Partial'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';

  return (
    <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#171717]">Workflow status sync</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-[#6e6e68]">
            Canonical stage for {snapshot.workflowId}, {snapshot.reviewId}, and {snapshot.publishingId}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${healthTone}`}>
            {snapshot.syncHealth}
          </span>
          <Tag>{snapshot.canonicalStage}</Tag>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {snapshot.surfaces.map((surface) => {
          const aligned = surface.present && surface.canonicalStage === snapshot.canonicalStage;
          const missing = !surface.present;

          return (
            <div
              key={`${surface.surface}-${surface.id}`}
              className={`rounded-xl border p-3 ${
                missing
                  ? 'border-[#deded8] bg-[#fbfbfa]'
                  : aligned
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#171717]">{surface.surface}</div>
                  <div className="mt-0.5 truncate text-[11px] text-[#8a8a82]">{surface.id}</div>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  missing
                    ? 'border-[#deded8] bg-white text-[#8a8a82]'
                    : aligned
                      ? 'border-emerald-200 bg-white text-emerald-700'
                      : 'border-amber-200 bg-white text-amber-800'
                }`}>
                  {missing ? 'Waiting' : aligned ? 'Aligned' : 'Check'}
                </span>
              </div>
              <div className="mt-2 text-xs font-semibold text-[#4f4f49]">{surface.status}</div>
              <div className="mt-1 text-[11px] text-[#6e6e68]">{surface.canonicalStage}</div>
              <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">{surface.detail}</p>
            </div>
          );
        })}
      </div>

      {snapshot.mismatchCount > 0 ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {snapshot.mismatchCount} surface{snapshot.mismatchCount === 1 ? '' : 's'} need status reconciliation before backend source-of-truth migration.
        </p>
      ) : null}
    </section>
  );
}
