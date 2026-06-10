'use client';

export type PublishingStatusProps = {
  status: string;
};

export function PublishingStatus({ status }: PublishingStatusProps) {
  const styles: Record<string, string> = {
    Ready: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]',
    Syncing: 'border-amber-200 bg-amber-50 text-amber-700',
    Failed: 'border-rose-200 bg-rose-50 text-rose-700',
    Queued: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
    Cancelled: 'border-[#d4d4d0] bg-[#f4f4f0] text-[#8c8c84]',
    Published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>{status}</span>;
}
