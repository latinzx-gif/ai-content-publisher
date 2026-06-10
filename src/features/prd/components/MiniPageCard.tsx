'use client';

import { MoreHorizontal } from 'lucide-react';
import type { ComponentType } from 'react';

export type MiniPageCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
};

export function MiniPageCard({ label, value, detail, icon: Icon }: MiniPageCardProps) {
  return (
    <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f4f2] text-[#171717]">
          <Icon className="h-4 w-4" />
        </div>
        <button aria-label={`Open actions for ${label}`} className="text-[#8b8b84] hover:text-[#171717]" type="button">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#171717]">{value}</div>
      <div className="mt-1 text-sm font-medium text-[#3d3d38]">{label}</div>
      <div className="mt-1 text-xs text-[#6e6e68]">{detail}</div>
    </div>
  );
}
