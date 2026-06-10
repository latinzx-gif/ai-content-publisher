import { inferDashboardLifecycleStage, normalizeWorkflowStage } from '@/features/prd/lib/workflow-stage';
import type { PublishingQueueRow } from '@/features/prd/types/api';
import type { BoardItem } from '@/features/prd/types/board';
import type { LogEvent } from '@/features/prd/types/logs';
import type { ReviewQueueItem } from '@/features/prd/types/review-queue';
import type { WorkflowStatusSnapshot, WorkflowStatusSurface } from '@/features/prd/types/workflow-status';

export function getReviewSurfaceStage(item: ReviewQueueItem | undefined) {
  if (!item) {
    return 'Missing';
  }

  if (item.status === 'Rejected') {
    return 'Text Ready';
  }

  return normalizeWorkflowStage(`${item.status} ${item.due}`);
}

function getPublishingSurfaceStage(row: PublishingQueueRow | undefined) {
  if (!row) {
    return 'Missing';
  }

  return normalizeWorkflowStage(`${row.status} ${row.time}`);
}

export function buildWorkflowStatusSnapshot({
  workflowId,
  reviewId,
  publishingId,
  boardItem,
  reviewItem,
  publishingRow,
  events,
  fallbackStage,
}: {
  workflowId: string;
  reviewId: string;
  publishingId: string;
  boardItem?: BoardItem;
  reviewItem?: ReviewQueueItem;
  publishingRow?: PublishingQueueRow;
  events: LogEvent[];
  fallbackStage: string;
}): WorkflowStatusSnapshot {
  const dashboardStage = boardItem ? inferDashboardLifecycleStage(boardItem) : 'Missing';
  const reviewStage = getReviewSurfaceStage(reviewItem);
  const publishingStage = getPublishingSurfaceStage(publishingRow);
  const latestLogStage = events[0]?.status ? normalizeWorkflowStage(events[0].status, fallbackStage) : 'Missing';
  const canonicalStage =
    publishingStage !== 'Missing'
      ? publishingStage
      : reviewStage !== 'Missing'
        ? reviewStage
        : dashboardStage !== 'Missing'
          ? dashboardStage
          : latestLogStage !== 'Missing'
            ? latestLogStage
            : normalizeWorkflowStage(fallbackStage);
  const surfaces: WorkflowStatusSurface[] = [
    {
      surface: 'Dashboard',
      id: workflowId,
      status: boardItem?.stage ?? boardItem?.due ?? 'Not present yet',
      canonicalStage: dashboardStage,
      detail: boardItem ? `${boardItem.owner} · ${boardItem.channel}` : 'No dashboard card has been created for this workflow yet.',
      present: Boolean(boardItem),
    },
    {
      surface: 'Review Queue',
      id: reviewId,
      status: reviewItem?.status ?? 'Not present yet',
      canonicalStage: reviewStage,
      detail: reviewItem ? `${reviewItem.owner} · ${reviewItem.due}` : 'Review package is not in queue for this workflow.',
      present: Boolean(reviewItem),
    },
    {
      surface: 'Publishing Queue',
      id: publishingId,
      status: publishingRow?.status ?? 'Not present yet',
      canonicalStage: publishingStage,
      detail: publishingRow ? `${publishingRow.platform} · ${publishingRow.time}` : 'Publishing job is not queued yet.',
      present: Boolean(publishingRow),
    },
    {
      surface: 'Logs',
      id: workflowId,
      status: events[0]?.status ?? 'No matching event yet',
      canonicalStage: latestLogStage,
      detail: `${events.length} linked workflow event${events.length === 1 ? '' : 's'}`,
      present: events.length > 0,
    },
  ];
  const presentSurfaces = surfaces.filter((surface) => surface.present);
  const mismatchCount = presentSurfaces.filter((surface) => surface.canonicalStage !== canonicalStage).length;
  const syncHealth = mismatchCount > 0 ? 'Needs attention' : presentSurfaces.length >= 3 ? 'Synced' : 'Partial';

  return {
    workflowId,
    reviewId,
    publishingId,
    canonicalStage,
    syncHealth,
    mismatchCount,
    surfaces,
  };
}
