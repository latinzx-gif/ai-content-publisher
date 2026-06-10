import { mapGeneratedAssetsFromMetadata, mapGeneratedDraftsFromMetadata } from '@/features/prd/lib/create-post-package';
import { formatQueueTime, minutesAgo } from '@/features/prd/lib/api-mappers/publishing';
import {
  buildReviewItemCreator,
  getFirstDefinedMetadataText,
  getFirstDefinedMetadataValue,
  parseReviewTimestamp,
} from '@/features/prd/lib/api-mappers/metadata';
import { normalizePresentationModel } from '@/features/prd/lib/api-mappers/dashboard';
import { normalizeTextValue } from '@/features/prd/lib/text';
import {
  getPublishingIdForWorkflowId,
  getDashboardIdForWorkflowId,
  getReviewIdForWorkflowId,
} from '@/features/prd/lib/workflow-ids';
import { normalizeBoardRisk } from '@/features/prd/types/board';
import type { ReviewApiResponse } from '@/features/prd/types/api';
import type { ReviewQueueItem } from '@/features/prd/types/review-queue';

export function capitalizeRisk(value: string | null | undefined) {
  switch ((value ?? '').toLowerCase()) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    default:
      return 'Low';
  }
}

export function statusToReviewLabel(status: string): ReviewQueueItem['status'] {
  switch ((status ?? '').toLowerCase()) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'changes_requested':
      return 'Needs changes';
    default:
      return 'In Review';
  }
}

export function detectReviewModeFromText(text?: string | null): string {
  const normalized = normalizeTextValue(text).toLowerCase();

  if (!normalized) {
    return '';
  }

  if (normalized.includes('quick ai') || normalized.includes('quick mode') || normalized.includes('quick')) {
    return 'quick';
  }

  if (normalized.includes('manual setup') || normalized.includes('manual mode') || normalized.includes('manual')) {
    return 'manual';
  }

  return '';
}

export function getReviewTypeLabel(reviewType?: string | null): string {
  const normalized = normalizeTextValue(reviewType).toLowerCase();

  if (!normalized) {
    return '';
  }

  return `${normalized} review`;
}

export function getReviewModeLabel(mode?: string | null): string {
  const normalizedMode = normalizeTextValue(mode).toLowerCase();
  const normalizedValue = normalizedMode
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .join(' ');

  if (normalizedMode === 'quick') {
    return 'Quick Mode';
  }

  if (normalizedMode === 'manual') {
    return 'Manual Mode';
  }

  if (normalizedValue === 'quick ai' || normalizedValue === 'quick mode' || normalizedValue.includes('quick')) {
    return 'Quick Mode';
  }

  if (normalizedValue === 'manual mode' || normalizedValue.includes('manual')) {
    return 'Manual Mode';
  }

  return 'Review';
}

export function normalizeSourceIdsFromStored(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) {
    return undefined;
  }

  const normalized = input
    .map((value) => normalizeTextValue(typeof value === 'string' ? value : ''))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : undefined;
}

export function buildReviewQueueSourceIds(values: {
  itemId?: string | null;
  reviewItemId?: string | null;
  workflowId?: string | null;
  publishingId?: string | null;
  alternateIds?: Array<string | null | undefined>;
}): string[] {
  const collected = new Set<string>();

  const add = (value?: string | null) => {
    const normalized = normalizeTextValue(value as string);
    if (!normalized) {
      return;
    }

    collected.add(normalized);
    collected.add(normalized.toLowerCase());
  };

  add(values.itemId);
  add(values.reviewItemId);
  add(values.workflowId);
  add(values.publishingId);

  for (const alternateId of values.alternateIds ?? []) {
    add(alternateId);
  }

  if (values.workflowId) {
    add(getDashboardIdForWorkflowId(values.workflowId));
    add(getReviewIdForWorkflowId(values.workflowId));
    add(getPublishingIdForWorkflowId(values.workflowId));
  }

  return Array.from(collected);
}

export function splitReviewIdList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return normalizeTextValue(value as string | undefined | null) ? [normalizeTextValue(value as string)] : [];
  }

  return value
    .map((item) => normalizeTextValue(typeof item === 'string' ? item : typeof item === 'number' ? String(item) : ''))
    .filter(Boolean);
}

export function buildReviewModeTitle(input: {
  title: string;
  modeLabel: string;
  numberLabel: string;
  hasModeLabel: boolean;
}) {
  const normalized = normalizeTextValue(input.title);
  if (!normalized) {
    return '';
  }

  const modePrefix = `${input.modeLabel} review`;
  const titleHasModePrefix = hasWordPrefix(normalized, modePrefix);
  if (input.hasModeLabel && titleHasModePrefix) {
    return normalized;
  }

  return `${input.modeLabel} Review${input.numberLabel ? ` #${input.numberLabel}` : ''}: ${normalized}`;
}

export function hasWordPrefix(text: string, prefix: string) {
  return text.toLowerCase().startsWith(prefix.toLowerCase());
}

export function formatReviewQueueNumber(workflowId?: string | null, contentItemId?: string | null, reviewItemId?: string | null): string {
  const candidates = [workflowId, contentItemId]
    .map((value) => normalizeTextValue(value))
    .filter(Boolean)
    .map((value) => value.replace(/[^a-zA-Z0-9-]/g, ''))
    .filter(Boolean);
  if (reviewItemId) {
    const normalizedReviewId = normalizeTextValue(reviewItemId);
    if (normalizedReviewId) {
      candidates.push(normalizedReviewId.replace(/[^a-zA-Z0-9-]/g, ''));
    }
  }

  if (candidates.length === 0) {
    return '';
  }

  const raw = candidates[0];
  const match = raw.match(/\d+/g)?.[0];
  if (match) {
    return match;
  }

  const seed = [...raw].reduce((total, char) => total + char.charCodeAt(0), 0);
  return `${seed % 1000000}`.padStart(6, '0');
}

export function buildReviewQueueTitle(input: {
  title?: string | null;
  reviewType?: string | null;
  category?: string | null;
  mode?: string | null;
  workflowId?: string | null;
  contentItemId?: string | null;
  reviewItemId?: string | null;
}) {
  const modeSource = input.mode ?? detectReviewModeFromText(input.title) ?? input.reviewType;
  const modeLabel = getReviewModeLabel(modeSource);
  const numberLabel = formatReviewQueueNumber(input.workflowId, input.contentItemId, input.reviewItemId);
  const hasModeLabel = modeLabel !== 'Review';

  const directTitle = normalizeTextValue(input.title);
  if (directTitle) {
    const modeAwareTitle = buildReviewModeTitle({
      title: directTitle,
      modeLabel,
      numberLabel,
      hasModeLabel,
    });

    return hasModeLabel ? modeAwareTitle : directTitle;
  }

  const fallbackByType = getReviewTypeLabel(input.reviewType);
  if (fallbackByType) {
    return hasModeLabel ? `${modeLabel} ${fallbackByType}${numberLabel ? ` #${numberLabel}` : ''}` : `${fallbackByType}${numberLabel ? ` #${numberLabel}` : ''}`;
  }

  const fallbackByCategory = normalizeTextValue(input.category);
  if (fallbackByCategory) {
    return hasModeLabel
      ? `${modeLabel} ${fallbackByCategory} review${numberLabel ? ` #${numberLabel}` : ''}`
      : `${fallbackByCategory} review${numberLabel ? ` #${numberLabel}` : ''}`;
  }

  if (numberLabel) {
    return hasModeLabel ? `${modeLabel} Review #${numberLabel}` : `Review #${numberLabel}`;
  }

  const fallbackById = normalizeTextValue(input.workflowId) || normalizeTextValue(input.contentItemId);
  if (fallbackById) {
    return `Review ${fallbackById}`;
  }

  return 'Review package';
}


export function mapMetadataStringList(metadata: Record<string, unknown> | null | undefined, key: string): string[] | undefined {
  const value = metadata?.[key];

  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

export function mapReviewPayload(data: ReviewApiResponse): ReviewQueueItem[] {
  return data.reviews.map((row) => {
    const metadata = row.content_items?.metadata ?? {};
    const presentation = normalizePresentationModel(row.presentation);
    const reviewCategory = (presentation?.subtitle || row.content_items?.service_area) ?? row.review_type;
    const workflowId =
      getFirstDefinedMetadataText(metadata, ['workflowId', 'workflow_id', 'contentItemId', 'content_item_id', 'content_item']) || row.content_item_id;
    const metadataReviewId = getFirstDefinedMetadataText(metadata, ['reviewId', 'review_id']);
    const metadataPublishingId = getFirstDefinedMetadataText(metadata, ['publishingId', 'publishing_id']);
    const contentRisk = row.risk_level ?? row.content_items?.risk_level;
    const mode = metadata.mode === 'manual' || metadata.mode === 'quick' ? metadata.mode : undefined;
    const imageCount = typeof metadata.imageCount === 'number' ? metadata.imageCount : undefined;
    const postCount = typeof metadata.postCount === 'number' ? metadata.postCount : undefined;
    const wordCount = typeof metadata.wordCount === 'number' ? metadata.wordCount : undefined;
    const metadataCreatedBy = buildReviewItemCreator(metadata, row.reviewer_name);
    const ownerFromMetadata = getFirstDefinedMetadataText(metadata, ['owner', 'assignedOwner', 'creator', 'created_by', 'creatorName']);
    const createdAt =
      parseReviewTimestamp(
        getFirstDefinedMetadataValue(metadata, ['createdAt', 'created_at', 'createdAtIso', 'created_at_iso', 'created_at_ms', 'timestamp', 'timeCreated', 'createdAtISOString']),
      ) ??
      parseReviewTimestamp(row.created_at) ??
      parseReviewTimestamp(row.updated_at);

    return {
      id: row.id,
      workflowId,
      publishingId: metadataPublishingId || getPublishingIdForWorkflowId(workflowId),
      createdAt,
      title: buildReviewQueueTitle({
        title: presentation?.title || row.content_items?.title,
        reviewType: row.review_type,
        category: reviewCategory,
        mode,
        workflowId,
        contentItemId: row.content_item_id,
        reviewItemId: metadataReviewId || row.id,
      }),
      owner: ownerFromMetadata || row.reviewer_name || row.assigned_reviewer || 'Review Queue',
      status: presentation?.approval_status_label || statusToReviewLabel(row.status),
      risk: normalizeBoardRisk(capitalizeRisk(contentRisk)),
      category: reviewCategory,
      createdBy: metadataCreatedBy,
      due: presentation?.updated_at_label || (row.due_at ? formatQueueTime(row.due_at) : minutesAgo(row.created_at)),
      approvalStatusLabel: presentation?.approval_status_label,
      approvalRecommendation: presentation?.approval_recommendation || (typeof metadata.approvalRecommendation === 'string' ? metadata.approvalRecommendation : undefined),
      approvalSummary: typeof metadata.approvalSummary === 'string' ? metadata.approvalSummary : undefined,
      assetComposerStatus: presentation?.image_status_label || (typeof metadata.assetComposerStatus === 'string' ? metadata.assetComposerStatus : undefined),
      assetLayoutPlan: mapMetadataStringList(metadata, 'assetLayoutPlan'),
      brandVoice: typeof metadata.brandVoice === 'string' ? metadata.brandVoice : undefined,
      bodyPreview: presentation?.body_preview,
      caption: presentation?.caption,
      citationStrictness: typeof metadata.sourcePolicy === 'string' ? metadata.sourcePolicy : typeof metadata.citationStrictness === 'string' ? metadata.citationStrictness : undefined,
      contentGoal: typeof metadata.contentGoal === 'string' ? metadata.contentGoal : undefined,
      contentItemStatus: row.content_items?.status ?? undefined,
      contentPreview: presentation?.content_preview,
      creativeSummary: presentation?.creative_summary || (typeof metadata.creativeSummary === 'string' ? metadata.creativeSummary : undefined),
      cta: presentation?.call_to_action || (typeof metadata.cta === 'string' ? metadata.cta : undefined),
      degradedMessage: presentation?.degraded_message || (typeof metadata.degradedMessage === 'string' ? metadata.degradedMessage : undefined),
      hashtags: presentation?.hashtags,
      imageCount,
      issuesFound: mapMetadataStringList(metadata, 'issuesFound'),
      languages: mapMetadataStringList(metadata, 'languages'),
      layout: presentation?.layout_summary || (typeof metadata.layout === 'string' ? metadata.layout : undefined),
      mode,
      nextActionLabel: presentation?.next_action_label,
      platform: presentation?.platform,
      platforms: mapMetadataStringList(metadata, 'platforms'),
      postCount,
      readinessStatus: presentation?.approval_status_label || (typeof metadata.readinessStatus === 'string' ? metadata.readinessStatus : undefined),
      requiredFix: presentation?.required_fix || (typeof metadata.requiredFix === 'string' ? metadata.requiredFix : undefined),
      selectedAssets: mapMetadataStringList(metadata, 'selectedAssets'),
      sourceConnectors: mapMetadataStringList(metadata, 'sourceConnectors'),
      subtitle: presentation?.subtitle,
      targetAudience: typeof metadata.targetAudience === 'string' ? metadata.targetAudience : undefined,
      updatedAtLabel: presentation?.updated_at_label,
      visualBrief: presentation?.layout_summary || (typeof metadata.visualBrief === 'string' ? metadata.visualBrief : undefined),
      generatedDrafts: mapGeneratedDraftsFromMetadata(metadata.generatedDrafts),
      generatedAssets: mapGeneratedAssetsFromMetadata(getFirstDefinedMetadataValue(metadata, ['generatedAssets', 'contentAssets', 'assets'])),
      wordCount,
      sourceIds: buildReviewQueueSourceIds({
        itemId: row.id,
        reviewItemId: metadataReviewId,
        workflowId,
        publishingId: metadataPublishingId,
        alternateIds: [row.content_item_id, workflowId],
      }),
    };
  });
}
