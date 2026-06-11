'use client';

import type { ComponentType } from 'react';

export function KnowledgeConnectionCard({
  actionHref,
  connected,
  description,
  icon: Icon,
  name,
  onAction,
}: {
  description: string;
  icon: ComponentType<{ className?: string }>;
  name: string;
  connected?: boolean;
  actionHref?: string;
  onAction?: () => void;
}) {
  const label = connected ? 'Connected' : 'Connect';

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-white text-[#171717] shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#171717]">{name}</h3>
          {actionHref ? (
            <a
              href={actionHref}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                connected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-[#cfcfc8] bg-white text-[#171717] hover:bg-[#f6f6f2]'
              }`}
            >
              {label}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                connected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-[#cfcfc8] bg-white text-[#171717] hover:bg-[#f6f6f2]'
              }`}
            >
              {label}
            </button>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{description}</p>
      </div>
    </div>
  );
}
