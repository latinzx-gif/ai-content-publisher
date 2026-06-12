"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  count: number;
  color?: string;
}

export function MetricCard({ label, count, color }: MetricCardProps) {
  return (
    <div className={cn("rounded-xl border border-[var(--line-warm)] bg-[var(--paper)] p-5 flex flex-col gap-1 min-w-[130px]", color)}>
      <span className="text-4xl font-bold text-[var(--navy)]">{count}</span>
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
    </div>
  );
}
