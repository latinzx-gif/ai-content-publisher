'use client';

import type { ComponentType } from 'react';

export function KnowledgeConnectionCard({
  description,
  icon: Icon,
  name,
  status,
}: {
  description: string;
  icon: ComponentType<{ className?: string }>;
  name: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-white text-[#171717] shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#171717]">{name}</h3>
          <button className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]">
            {status}
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{description}</p>
      </div>
    </div>
  );
}


