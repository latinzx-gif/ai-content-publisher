'use client';

import type { ComponentType } from 'react';

export type SystemStateCardProps = {
  action: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  muted?: boolean;
  title: string;
  warning?: boolean;
  onClickAction: () => void;
};

export function SystemStateCard({
  action,
  description,
  icon: Icon,
  label,
  muted = false,
  title,
  warning = false,
  onClickAction,
}: SystemStateCardProps) {
  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)] ${warning ? 'border-amber-200' : 'border-[#deded8]'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${warning ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{title}</div>
          <h3 className="mt-1 text-sm font-semibold text-[#171717]">{label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{description}</p>
        </div>
      </div>
      <button
        onClick={onClickAction}
        className={`mt-3 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
          muted
            ? 'border-[#deded8] bg-[#f6f6f2] text-[#8a8a82]'
            : warning
              ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-white'
              : 'border-[#cfcfc8] bg-[#f6f6f2] text-[#171717] hover:bg-white'
        }`}
      >
        {action}
      </button>
    </div>
  );
}
