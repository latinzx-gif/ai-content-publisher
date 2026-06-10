'use client';

import { libraryItems } from '@/features/prd/config/content-library';

export function LibraryRow({
  item,
  onEdit,
  onRecycle,
  onSelect,
  selected,
}: {
  item: (typeof libraryItems)[number];
  onEdit: (item: (typeof libraryItems)[number]) => void;
  onRecycle: (item: (typeof libraryItems)[number]) => void;
  onSelect: (item: (typeof libraryItems)[number]) => void;
  selected: boolean;
}) {
  const statusStyles: Record<string, string> = {
    Approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'Needs update': 'border-amber-200 bg-amber-50 text-amber-700',
    Draft: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
  };

  return (
    <article className={`grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] lg:grid-cols-[1fr_150px_128px_132px] lg:items-center ${selected ? 'bg-[#f4f7fd]' : ''}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#8a8a82]">{item.id}</span>
          <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{item.category}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[item.status]}`}>{item.status}</span>
        </div>
        <button className="mt-1 block max-w-full truncate text-left text-sm font-semibold text-[#171717] hover:text-[#1f5eff]" onClick={() => onSelect(item)} type="button">
          {item.title}
        </button>
        <div className="mt-1 text-xs text-[#6e6e68]">{item.language} · {item.updated} · Reuse: {item.reuse}</div>
      </div>

      <div className="flex -space-x-2">
        {Array.from({ length: Math.min(item.assets, 5) }).map((_, index) => (
          <span key={index} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white bg-[#ecece7] text-[10px] font-semibold text-[#6e6e68]">
            {index + 1}
          </span>
        ))}
        {item.assets > 5 && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white bg-[#f6f6f2] text-[10px] font-semibold text-[#6e6e68]">
            +{item.assets - 5}
          </span>
        )}
      </div>

      <div className="text-xs font-medium text-[#6e6e68]">{item.assets} assets</div>

      <div className="flex items-center gap-2 lg:justify-end">
        <button className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]" onClick={() => onEdit(item)} type="button">
          Edit
        </button>
        <button className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#6e6e68] hover:bg-[#f6f6f2]" onClick={() => onRecycle(item)} type="button">
          Recycle
        </button>
      </div>
    </article>
  );
}

