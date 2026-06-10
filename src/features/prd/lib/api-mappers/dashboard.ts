import { Clock3, Layers3, ShieldCheck, Zap } from 'lucide-react';
import type { ComponentType } from 'react';
import type { PrdPresentationModel } from '@/lib/prdPresentation';
import { mapGeneratedAssetsFromMetadata, mapGeneratedDraftsFromMetadata } from '@/features/prd/lib/create-post-package';
import { getReviewSurfaceStage } from '@/features/prd/lib/workflow-status-snapshot';
import {
  buildReviewIdMatchSignatures,
  getReviewQueueItemMatchSignatures,
  getReviewQueueSortValue,
  hasMatchingSignatures,
} from '@/features/prd/lib/review-queue-match';
import { normalizeTextValue } from '@/features/prd/lib/text';
import { getDashboardIdForWorkflowId } from '@/features/prd/lib/workflow-ids';
import { normalizeBoardRisk, type BoardItem } from '@/features/prd/types/board';
import type {
  DashboardActivity,
  DashboardAgent,
  DashboardBoard,
  DashboardPayload,
  DashboardStat,
  DashboardStatAction,
  DashboardStatIcon,
  DashboardStatSource,
} from '@/features/prd/types/dashboard';
import { normalizeLanguageCodesFromStored } from '@/features/prd/lib/api-mappers/review-queue-storage';
import type { ReviewQueueItem } from '@/features/prd/types/review-queue';

export const dashboardStatIcons: Record<DashboardStatIcon, ComponentType<{ className?: string }>> = {
  Layers3,
  ShieldCheck,
  Clock3,
  Zap,
};

export function getDashboardStatAction(stat: DashboardStatSource): DashboardStatAction {
  const normalized = `${stat.label} ${stat.change}`.toLowerCase();

  if (normalized.includes('need review') || (normalized.includes('need') && normalized.includes('review'))) {
    return 'need-review';
  }

  if (normalized.includes('scheduled')) {
    return 'scheduled';
  }

  if (normalized.includes('agent') && normalized.includes('run')) {
    return 'agent-runs';
  }

  if (normalized.includes('working')) {
    return 'working-posts';
  }

  return 'default';
}

export function normalizeDashboardCounts(board: DashboardBoard[]): DashboardBoard[] {
  return board.map((column) => ({
    ...column,
    count: column.items.length,
    items: column.items.map(normalizeDashboardBoardItem),
  }));
}

export function normalizePresentationModel(value: PrdPresentationModel | null | undefined): PrdPresentationModel | undefined {
  if (!value) {
    return undefined;
  }

  return {
    ...value,
    title: normalizeTextValue(value.title),
    subtitle: normalizeTextValue(value.subtitle),
    platform: normalizeTextValue(value.platform),
    status_label: normalizeTextValue(value.status_label),
    priority_label: normalizeTextValue(value.priority_label),
    content_preview: normalizeTextValue(value.content_preview),
    body_preview: normalizeTextValue(value.body_preview),
    caption: normalizeTextValue(value.caption),
    hashtags: Array.isArray(value.hashtags) ? value.hashtags.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0) : undefined,
    call_to_action: normalizeTextValue(value.call_to_action),
    image_preview_url: normalizeTextValue(value.image_preview_url),
    image_status_label: normalizeTextValue(value.image_status_label),
    layout_summary: normalizeTextValue(value.layout_summary),
    creative_summary: normalizeTextValue(value.creative_summary),
    approval_status_label: normalizeTextValue(value.approval_status_label),
    approval_recommendation: normalizeTextValue(value.approval_recommendation),
    required_fix: normalizeTextValue(value.required_fix),
    degraded_message: normalizeTextValue(value.degraded_message),
    next_action_label: normalizeTextValue(value.next_action_label),
    agent_name: normalizeTextValue(value.agent_name),
    updated_at_label: normalizeTextValue(value.updated_at_label),
  };
}

export function normalizeDashboardBoardItem(item: BoardItem): BoardItem {
  const presentation = normalizePresentationModel(item.presentation);

  return {
    ...item,
    title: presentation?.title || item.title,
    channel: presentation?.platform || item.channel,
    due: presentation?.updated_at_label || item.due,
    generatedDrafts: mapGeneratedDraftsFromMetadata(item.generatedDrafts),
    generatedAssets: mapGeneratedAssetsFromMetadata(item.generatedAssets),
    selectedAssets: normalizeLanguageCodesFromStored(item.selectedAssets),
    assetLayoutPlan: normalizeLanguageCodesFromStored(item.assetLayoutPlan),
    visualBrief: presentation?.layout_summary || normalizeTextValue(item.visualBrief),
    layout: presentation?.layout_summary || normalizeTextValue(item.layout),
    contentItemStatus: normalizeTextValue(item.contentItemStatus),
    imageCount: typeof item.imageCount === 'number' ? item.imageCount : undefined,
    wordCount: typeof item.wordCount === 'number' ? item.wordCount : undefined,
    presentation,
  };
}

export function mapReviewItemToDashboardBoardItem(item: ReviewQueueItem): BoardItem {
  const workflowId = getDashboardIdForWorkflowId(item.workflowId || item.id);
  const risk = normalizeBoardRisk(item.risk);
  const channels = (item.platforms?.filter(Boolean) ?? []).join(', ') || item.category || 'Content workflow';
  const tone: BoardItem['tone'] = risk === 'High' ? 'rose' : risk === 'Medium' ? 'amber' : 'emerald';

  const itemRecord: BoardItem = {
    id: workflowId,
    title: item.title || item.contentPreview || `Review ${workflowId}`,
    owner: item.owner || 'Review Queue',
    channel: channels,
    due: item.due || 'Queued',
    risk,
    tone,
    stage: getReviewSurfaceStage(item),
    contentItemStatus: item.contentItemStatus,
    generatedDrafts: item.generatedDrafts,
    generatedAssets: item.generatedAssets,
    imageCount: item.imageCount,
    selectedAssets: item.selectedAssets,
    assetLayoutPlan: item.assetLayoutPlan,
    layout: item.layout,
    visualBrief: item.visualBrief,
    wordCount: item.wordCount,
    presentation: {
      title: item.title,
      subtitle: item.category,
      platform: channels,
      status_label: item.status,
      priority_label: item.risk,
      content_preview: item.contentPreview,
      body_preview: item.bodyPreview,
      caption: item.caption,
      hashtags: item.hashtags,
      call_to_action: item.cta,
      image_preview_url: item.generatedAssets?.find((asset) => !asset.isPlaceholder && Boolean(asset.url))?.url,
      image_status_label: item.degradedMessage ? 'Generation failed' : item.generatedAssets?.some((asset) => !asset.isPlaceholder && Boolean(asset.url || asset.storagePath)) ? 'Output ready' : item.generatedAssets?.length ? 'Pending generation' : undefined,
      layout_summary: item.visualBrief,
      creative_summary: item.creativeSummary,
      approval_status_label: item.readinessStatus ?? item.status,
      approval_recommendation: item.approvalRecommendation,
      required_fix: item.requiredFix,
      degraded_message: item.degradedMessage,
      next_action_label: item.status === 'In Review' ? 'Complete review' : 'Continue workflow',
      updated_at_label: item.due,
    },
  };

  return itemRecord;
}

export function syncDashboardBoardWithInReviewItems(board: DashboardBoard[], reviewItems: ReviewQueueItem[]) {
  const inReviewEntries = reviewItems
    .filter((item) => item.status === 'In Review')
    .map((item) => ({
      reviewItem: item,
      boardItem: mapReviewItemToDashboardBoardItem(item),
      boardSignatures: getReviewQueueItemMatchSignatures(item),
    }))
    .sort((a, b) => getReviewQueueSortValue(b.reviewItem) - getReviewQueueSortValue(a.reviewItem))
    .reduce(
      (
        acc: Array<{
          reviewItem: ReviewQueueItem;
          boardItem: BoardItem;
          boardSignatures: Set<string>;
        }>,
        entry,
      ) => {
        const hasDuplicate = acc.some((current) => hasMatchingSignatures(entry.boardSignatures, current.boardSignatures));

        if (!hasDuplicate) {
          acc.push(entry);
        }

        return acc;
      },
      [],
    );

  const inReviewItems = inReviewEntries.map((entry) => entry.boardItem);
  const inReviewSignatures = inReviewEntries.map((entry) => entry.boardSignatures);

  if (inReviewItems.length === 0) {
    return board;
  }

  const boardWithoutInReviewReferences = board.map((column) => ({
    ...column,
    items: column.items.filter((boardItem) => {
      const boardSignatures = buildReviewIdMatchSignatures(boardItem.id);

      return !inReviewSignatures.some((reviewSignatures) => hasMatchingSignatures(boardSignatures, reviewSignatures));
    }),
  }));

  const nextBoard = boardWithoutInReviewReferences.some((column) => column.column === 'In Review')
    ? boardWithoutInReviewReferences.map((column) =>
        column.column === 'In Review'
          ? {
              ...column,
              items: inReviewItems,
            }
          : column,
      )
    : [
        ...boardWithoutInReviewReferences,
        {
          column: 'In Review',
          count: inReviewItems.length,
          items: inReviewItems,
        },
      ];

  return normalizeDashboardCounts(nextBoard);
}

export function mapDashboardPayload(payload: DashboardPayload): {
  stats: DashboardStat[];
  board: DashboardBoard[];
  agents: DashboardAgent[];
  activity: DashboardActivity[];
} {
  return {
    stats: payload.stats.map((item) => ({
      ...item,
      icon: dashboardStatIcons[item.icon] ?? Layers3,
      action: item.action ?? getDashboardStatAction(item),
    })),
    board: normalizeDashboardCounts(payload.board),
    agents: payload.agents,
    activity: payload.activity.map((entry) => ({
      ...entry,
      message:
        (typeof entry.presentation?.readable_message === 'string' && entry.presentation.readable_message) ||
        (typeof entry.presentation?.user_facing_summary === 'string' && entry.presentation.user_facing_summary) ||
        entry.message,
    })),
  };
}

export const fallbackDashboardStats: DashboardStatSource[] = [];
export const fallbackDashboardBoard: DashboardBoard[] = [];
export const fallbackDashboardAgents: DashboardAgent[] = [];
export const fallbackDashboardActivity: DashboardActivity[] = [];

export const fallbackDashboardData: {
  stats: DashboardStat[];
  board: DashboardBoard[];
  agents: DashboardAgent[];
  activity: DashboardActivity[];
} = mapDashboardPayload({
  stats: fallbackDashboardStats,
  board: fallbackDashboardBoard,
  agents: fallbackDashboardAgents,
  activity: fallbackDashboardActivity,
});
