'use client';

import { Clock3, Search, ShieldCheck } from 'lucide-react';

import { SystemStateCard } from '@/features/prd/components/primitives/SystemStateCard';

export type StatePreviewStripProps = {
  onResetState: () => void;
  onOpenRunning: () => void;
  onViewDetails: () => void;
};

export function StatePreviewStrip({
  onResetState,
  onOpenRunning,
  onViewDetails,
}: StatePreviewStripProps) {
  return (
    <section className="mt-4 grid gap-3 lg:grid-cols-3">
      <SystemStateCard
        icon={Search}
        title="Empty state"
        label="No matching content"
        description="Use this when search/filter returns nothing. Offer a clear reset or create action."
        action="Reset filters"
        onClickAction={onResetState}
      />
      <SystemStateCard
        icon={Clock3}
        title="Loading state"
        label="AI is checking sources"
        description="Use while RAG, generation, compliance checks, or publishing sync is running."
        action="Running..."
        muted
        onClickAction={onOpenRunning}
      />
      <SystemStateCard
        icon={ShieldCheck}
        title="Error state"
        label="Action needs attention"
        description="Use for expired tokens, failed sync, missing citation, or blocked generation."
        action="View details"
        warning
        onClickAction={onViewDetails}
      />
    </section>
  );
}
