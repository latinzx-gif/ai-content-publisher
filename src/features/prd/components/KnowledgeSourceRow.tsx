'use client';

import { knowledgeSources } from '@/features/prd/config/knowledge-base-display';

export function KnowledgeSourceRow({ source }: { source: (typeof knowledgeSources)[number] }) {
  const statusStyles: Record<string, string> = {
    Indexed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Processing: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]',
    'Needs review': 'border-amber-200 bg-amber-50 text-amber-700',
  };

  return (
    <article className="grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] lg:grid-cols-[1fr_132px_118px_120px] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{source.type}</span>
          <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#6e6e68]">{source.category}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[source.status]}`}>{source.status}</span>
        </div>
        <h3 className="mt-1 truncate text-sm font-semibold text-[#171717]">{source.name}</h3>
        <p className="mt-1 text-xs text-[#6e6e68]">{source.updated}</p>
      </div>
      <div className="text-xs font-medium text-[#4f4f49]">{source.chunks} chunks</div>
      <div className="text-xs text-[#6e6e68]">RAG ready</div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center lg:justify-end">
        <button className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]" type="button">
          Open
        </button>
        <button className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#6e6e68] hover:bg-[#f6f6f2]" type="button">
          Reindex
        </button>
      </div>
    </article>
  );
}

