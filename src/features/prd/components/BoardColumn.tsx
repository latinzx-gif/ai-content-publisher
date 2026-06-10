'use client';

import { Circle, Plus } from 'lucide-react';

import { BoardCard } from '@/features/prd/components/BoardCard';
import type { BoardItem } from '@/features/prd/types/board';

export type BoardColumnProps = {
  column: string;
  count: number;
  items: BoardItem[];
  selectedBoardItemId?: string | null;
  onAddBoardItem: () => void;
  onOpenBoardItem: (item: BoardItem) => void;
};

export function BoardColumn({
  column,
  count,
  items,
  selectedBoardItemId,
  onAddBoardItem,
  onOpenBoardItem,
}: BoardColumnProps) {
  return (
    <div className="min-h-[430px] rounded-xl border border-[#e1e1dc] bg-[#f3f3f0] p-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Circle className="h-2.5 w-2.5 fill-[#8b8b84] text-[#8b8b84]" />
          <h3 className="text-xs font-semibold text-[#3d3d38]">{column}</h3>
          <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">{count}</span>
        </div>
        <button aria-label={`Add item to ${column}`} onClick={onAddBoardItem} className="text-[#8b8b84] hover:text-[#171717]" type="button">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <BoardCard
            key={item.id}
            item={item}
            selected={selectedBoardItemId === item.id}
            onOpenBoardItem={() => onOpenBoardItem(item)}
          />
        ))}
      </div>
    </div>
  );
}
