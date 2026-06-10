'use client';

import type { CalendarPostStatus } from '@/features/prd/types/api';

export type LegendDotProps = {
  label: string;
  tone: CalendarPostStatus;
};

export function LegendDot({ label, tone }: LegendDotProps) {
  const styles = {
    queued: 'bg-[#4f6f9f]',
    posted: 'bg-emerald-500',
    draft: 'bg-[#8b8b84]',
    issue: 'bg-rose-500',
  };

  return (
    <div className="flex items-center gap-2 text-xs text-[#4f4f49]">
      <span className={`h-2.5 w-2.5 rounded-full ${styles[tone]}`} />
      {label}
    </div>
  );
}
