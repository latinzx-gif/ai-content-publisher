'use client';

import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { AlertIcon } from '@/features/prd/components/primitives/AlertIcon';
import { ChannelCard } from '@/features/prd/components/ChannelCard';
import { PublishingStatus } from '@/features/prd/components/PublishingStatus';
import { planEntitlements } from '@/features/prd/config/plan-entitlements';
import {
  buildReviewQueueTargetMatchSignatures,
  hasReviewQueueValueMatch,
} from '@/features/prd/lib/review-queue-match';
import type { PublishingChannelSummary, PublishingErrorRow, PublishingQueueRow } from '@/features/prd/types/api';


export function PublishingView({
  channels,
  queue,
  errors,
  summary,
  loading,
  actionLoading,
  actionError,
  targetQueueId,
  onPublishNow,
  onCancel,
  onPublishSelected,
  onOpenContentJob,
  onNoopAction,
}: {
  channels: PublishingChannelSummary[];
  queue: PublishingQueueRow[];
  errors: PublishingErrorRow[];
  summary: Record<string, number> | null;
  loading: boolean;
  actionLoading: string;
  actionError: string;
  targetQueueId?: string | null;
  onPublishNow: (id: string) => void;
  onCancel: (id: string) => void;
  onPublishSelected: (ids: string[], onConfirmed: () => void) => void;
  onOpenContentJob: (id: string) => void;
  onNoopAction: (message: string) => void;
  }) {
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  const publishableQueue = queue.filter((item) => item.status === 'Ready' || item.status === 'Queued');
  const targetQueueSignatures = targetQueueId ? buildReviewQueueTargetMatchSignatures([targetQueueId]) : null;
  const targetQueueItem = targetQueueSignatures ? queue.find((item) => hasReviewQueueValueMatch(item.id, targetQueueSignatures)) ?? null : null;
  const isTargetQueueItem = (item: PublishingQueueRow) => (targetQueueSignatures ? hasReviewQueueValueMatch(item.id, targetQueueSignatures) : false);
  const selectedCount = selectedQueueIds.length;
  const allPublishableSelected = publishableQueue.length > 0 && publishableQueue.every((item) => selectedQueueIds.includes(item.id));
  const failedChannel = channels.find((channel) => channel.status === 'Failed');
  const latestError = errors[0];
  const publishingLocked = !planEntitlements.publishingIntegrations;
  const toggleSelectedQueueItem = (id: string) => {
    setSelectedQueueIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  };
  const toggleAllPublishable = () => {
    setSelectedQueueIds(allPublishableSelected ? [] : publishableQueue.map((item) => item.id));
  };
  const publishSelected = () => {
    if (publishingLocked) {
      onNoopAction('Publishing integrations are locked on the current plan');
      return;
    }

    if (selectedQueueIds.length === 0) {
      onNoopAction('Select at least one publish-ready post first');
      return;
    }

    onPublishSelected(selectedQueueIds, () => {
      onNoopAction(`Publishing ${selectedQueueIds.length} selected posts`);
      setSelectedQueueIds([]);
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 space-y-4">
        <div className="rounded-2xl border border-[#deded8] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center gap-2">
          {channels.map((channel) => (
            <ChannelCard key={channel.name} channel={channel} />
          ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Publishing queue</h2>
              <p className="mt-0.5 text-xs text-[#6e6e68]">Posts waiting to sync across LinkedIn, Facebook, WordPress, and newsletter.</p>
            </div>
            {summary && <div className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-1 text-[11px] font-semibold text-[#4f4f49]">Total jobs: {summary.total}</div>}
            <button
              onClick={toggleAllPublishable}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              type="button"
            >
              {allPublishableSelected ? 'Clear selected' : 'Select ready'}
            </button>
            {actionError && <p className="text-[11px] font-semibold text-rose-700">{actionError}</p>}
            {loading && <p className="text-[11px] font-semibold text-[#6e6e68]">Loading live publishing data...</p>}
            <button
              disabled={selectedCount === 0 || publishingLocked}
              onClick={publishSelected}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Publish selected {selectedCount > 0 ? `(${selectedCount})` : ''}
            </button>
          </div>
          <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-4 py-2 text-xs text-[#6e6e68]">
            {selectedCount > 0
              ? `${selectedCount} publish-ready post${selectedCount > 1 ? 's' : ''} selected for batch publishing.`
              : 'Select Ready or Queued posts to enable batch publishing.'}
          </div>
          {targetQueueId ? (
            <div className="border-b border-[#d9e0ef] bg-[#f4f7fd] px-4 py-3 text-xs text-[#2f4f7f]">
              {targetQueueItem
                ? `Focused from Dashboard: ${targetQueueItem.id} · ${targetQueueItem.title} · ${targetQueueItem.status}`
                : `Focused from Dashboard: ${targetQueueId} has not entered Publishing Queue yet.`}
            </div>
          ) : null}

          <div className="divide-y divide-[#e8e8e4]">
              {queue.map((item) => (
                <div
                  key={item.id}
                  data-target={isTargetQueueItem(item) ? 'true' : undefined}
                  className={`grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] lg:grid-cols-[32px_1fr_128px_112px_236px] lg:items-center ${
                  isTargetQueueItem(item) ? 'bg-[#f4f7fd] ring-1 ring-inset ring-[#cfd8ea]' : ''
                }`}
              >
                <label className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#deded8] bg-white">
                  <span className="sr-only">Select {item.title}</span>
                  <input
                    checked={selectedQueueIds.includes(item.id)}
                    disabled={item.status !== 'Ready' && item.status !== 'Queued'}
                    onChange={() => toggleSelectedQueueItem(item.id)}
                    className="h-3.5 w-3.5 accent-[#2f4f7f] disabled:cursor-not-allowed"
                    type="checkbox"
                  />
                </label>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#8a8a82]">{item.id}</span>
                    <PublishingStatus status={item.status} />
                  </div>
                  <h3 className="mt-1 truncate text-sm font-semibold text-[#171717]">{item.title}</h3>
                </div>
                <div className="text-xs font-medium text-[#4f4f49]">{item.platform}</div>
                <div className="text-xs text-[#6e6e68]">{item.time}</div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
                  <button
                    className="rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 py-1.5 text-xs font-semibold text-[#4f4f49] hover:bg-white"
                    onClick={() => onOpenContentJob(item.id)}
                    type="button"
                  >
                    Detail
                  </button>
                  <button
                    className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]"
                    onClick={() => (publishingLocked ? onNoopAction('Publishing integrations are locked on the current plan') : onPublishNow(item.id))}
                    disabled={publishingLocked || actionLoading === item.id || item.status === 'Published' || item.status === 'Cancelled'}
                    type="button"
                  >
                    {publishingLocked ? 'Locked' : item.status === 'Failed' ? 'Retry' : item.status === 'Syncing' ? 'Complete Sync' : item.status === 'Published' ? 'Posted' : 'Publish Now'}
                  </button>
                  <button
                    className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#6e6e68] hover:bg-[#f6f6f2]"
                    onClick={() => (publishingLocked ? onNoopAction('Publishing integrations are locked on the current plan') : onCancel(item.id))}
                    disabled={publishingLocked || actionLoading === item.id || item.status === 'Published' || item.status === 'Cancelled'}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <AlertIcon />
            <div>
              <h2 className="text-sm font-semibold text-rose-900">{failedChannel ? `${failedChannel.name} needs attention` : 'Manual fallback ready'}</h2>
              <p className="mt-1 text-xs leading-relaxed text-rose-700">
                {latestError?.message ?? failedChannel?.health ?? 'If a platform rejects sync, retry from the queue or publish manually and record the result.'}
              </p>
              <button
                onClick={() => onNoopAction(failedChannel ? `Reconnect ${failedChannel.name} integration` : 'Open manual publishing fallback')}
                className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800"
                type="button"
              >
                {failedChannel ? 'Reconnect' : 'Manual fallback'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h2 className="text-sm font-semibold text-[#171717]">Error log</h2>
          <div className="mt-4 space-y-3">
            {errors.map((error) => (
              <div key={`${error.time}-${error.message}`} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#8a8a82]">{error.time}</span>
                  <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">
                    {error.platform}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#4f4f49]">{error.message}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

