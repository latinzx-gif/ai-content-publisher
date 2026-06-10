'use client';

import { Circle, Plus } from 'lucide-react';

import { BoardCard } from '@/features/prd/components/BoardCard';
import type { BoardItem } from '@/features/prd/types/board';
import type { DashboardBoard } from '@/features/prd/types/dashboard';

export type MobileBoardStackProps = {
  board: DashboardBoard[];
  selectedBoardItemId?: string | null;
  onAddBoardItem: () => void;
  onOpenBoardItem: (item: BoardItem) => void;
};

export function MobileBoardStack({
  board,
  selectedBoardItemId,
  onAddBoardItem,
  onOpenBoardItem,
}: MobileBoardStackProps) {
  return (
    <div className="space-y-3 lg:hidden">
      <div className="rounded-xl border border-[#deded8] bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Mobile pipeline</h3>
            <p className="mt-1 text-xs text-[#6e6e68]">Stacked view for small screens. Desktop keeps the full kanban board.</p>
          </div>
          <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
            {board.reduce((sum, column) => sum + column.items.length, 0)} items
          </span>
        </div>
      </div>
      {board.map((column) => (
        <section key={column.column} className="rounded-xl border border-[#e1e1dc] bg-[#f3f3f0] p-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Circle className="h-2.5 w-2.5 fill-[#8b8b84] text-[#8b8b84]" />
              <h3 className="text-xs font-semibold text-[#3d3d38]">{column.column}</h3>
              <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">{column.count}</span>
            </div>
            <button aria-label={`Add item to ${column.column}`} onClick={onAddBoardItem} className="text-[#8b8b84] hover:text-[#171717]" type="button">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {column.items.slice(0, 3).map((item) => (
              <BoardCard
                key={item.id}
                item={item}
                selected={selectedBoardItemId === item.id}
                onOpenBoardItem={() => onOpenBoardItem(item)}
              />
            ))}
            {column.items.length > 3 ? (
              <button
                onClick={onAddBoardItem}
                className="rounded-lg border border-dashed border-[#cfcfc8] bg-white px-3 py-2 text-left text-xs font-semibold text-[#6e6e68] hover:bg-[#f6f6f2]"
                type="button"
              >
                +{column.items.length - 3} more in {column.column}
              </button>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
