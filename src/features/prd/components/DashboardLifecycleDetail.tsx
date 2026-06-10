'use client';

import { Tag } from '@/features/prd/components/primitives/Tag';
import { dashboardLifecycleStages } from '@/features/prd/config/dashboard-lifecycle';
import { getPublishingIdForWorkflowId, getReviewIdForWorkflowId } from '@/features/prd/lib/workflow-ids';
import { inferDashboardLifecycleStage } from '@/features/prd/lib/workflow-stage';
import type { BoardItem } from '@/features/prd/types/board';

export type DashboardLifecycleDetailProps = {
  item: BoardItem;
};

export function DashboardLifecycleDetail({ item }: DashboardLifecycleDetailProps) {
  const currentStage = inferDashboardLifecycleStage(item);
  const currentIndex = dashboardLifecycleStages.indexOf(currentStage as (typeof dashboardLifecycleStages)[number]);
  const reviewId = getReviewIdForWorkflowId(item.id);
  const publishingId = getPublishingIdForWorkflowId(item.id);

  return (
    <section className="mt-3 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-[#171717]">Lifecycle detail</h3>
          <p className="mt-0.5 text-[11px] text-[#6e6e68]">Same content item across Dashboard, Review Queue, Publishing Queue, and Logs.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Tag>{reviewId}</Tag>
          <Tag>{publishingId}</Tag>
          <Tag>{currentStage}</Tag>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-7">
        {dashboardLifecycleStages.map((stage, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <div
              key={stage}
              className={`rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                active
                  ? 'border-[#1f5eff] bg-[#f4f7fd] text-[#1f5eff]'
                  : done
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-[#deded8] bg-white text-[#8a8a82]'
              }`}
            >
              <div>{stage}</div>
              <div className="mt-1 text-[10px] font-medium opacity-75">{active ? 'Current' : done ? 'Done' : 'Pending'}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
