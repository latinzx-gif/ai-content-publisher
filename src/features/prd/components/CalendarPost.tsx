'use client';

import type { CalendarDayPost } from '@/features/prd/types/api';

export type CalendarPostProps = {
  post: CalendarDayPost;
  draggable?: boolean;
  onReschedule?: (post: CalendarDayPost) => void;
};

export function CalendarPost({ draggable = false, onReschedule, post }: CalendarPostProps) {
  const styles: Record<string, string> = {
    queued: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]',
    posted: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    draft: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
    issue: 'border-rose-200 bg-rose-50 text-rose-800',
  };

  return (
    <button
      className={`w-full rounded-md border px-2 py-1.5 text-left shadow-[0_1px_1px_rgba(20,20,20,0.025)] ${styles[post.status]}`}
      draggable={draggable}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onReschedule?.(post);
      }}
      onDragStart={(event) => {
        if (!draggable) {
          return;
        }

        event.dataTransfer.setData(
          'application/json',
          JSON.stringify({
            contentItemId: post.id,
          }),
        );
      }}
      onDragEnd={() => {
        // noop
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
        <span className="truncate text-[11px] font-semibold">{post.title}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2 pl-3 text-[10px] opacity-75">
        <span className="truncate">{post.service}</span>
        <span className="shrink-0 font-semibold">Reschedule</span>
      </div>
    </button>
  );
}
