'use client';

import { MoreHorizontal } from 'lucide-react';

import { RiskBadge } from '@/features/prd/components/primitives/RiskBadge';
import { Tag } from '@/features/prd/components/primitives/Tag';
import type { BoardItem } from '@/features/prd/types/board';

export type BoardCardProps = {
  item: BoardItem;
  selected?: boolean;
  onOpenBoardItem: () => void;
};

export function BoardCard({
  item,
  selected = false,
  onOpenBoardItem,
}: BoardCardProps) {
  const accents = {
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    slate: 'bg-[#8b8b84]',
  };

  return (
    <button
      type="button"
      onClick={onOpenBoardItem}
      className={`w-full rounded-lg border bg-white p-2.5 text-left shadow-[0_1px_1px_rgba(20,20,20,0.035)] transition hover:border-[#c9c9c1] hover:shadow-[0_2px_6px_rgba(20,20,20,0.06)] ${
        selected ? 'border-[#2f4f7f] bg-[#f4f7fd]' : 'border-[#deded8]'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${accents[item.tone]}`} />
          <span className="truncate text-[11px] font-semibold text-[#6e6e68]">{item.id}</span>
        </div>
        <RiskBadge risk={item.risk} />
      </div>
      <h4 className="line-clamp-2 text-[13px] font-medium leading-snug text-[#20201d]">{item.title}</h4>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Tag>{item.channel}</Tag>
        <Tag>{item.due}</Tag>
        {item.stage ? <Tag>{item.stage}</Tag> : null}
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-[#eeeeea] pt-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#deded8] bg-[#f6f6f2] text-[9px] font-bold text-[#3d3d38]">
            {item.owner.slice(0, 1)}
          </div>
          <span className="truncate text-[11px] text-[#6e6e68]">{item.owner}</span>
        </div>
        <span className="text-[#8b8b84]" aria-hidden="true">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}
