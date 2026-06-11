import { mapGeneratedAssetsFromMetadata } from '@/features/prd/lib/create-post-package';
import { getFirstDefinedMetadataText } from '@/features/prd/lib/api-mappers/metadata';
import { normalizeSourceIdsFromStored } from '@/features/prd/lib/api-mappers/review';
import { normalizeTextValue } from '@/features/prd/lib/text';
import { normalizeBoardRisk } from '@/features/prd/types/board';
import type { GeneratedDraft } from '@/features/prd/types/content';
import type { ReviewQueueItem } from '@/features/prd/types/review-queue';

export const REVIEW_QUEUE_LOCAL_STORAGE_KEY = 'prd_review_queue_items_v1';

export function normalizeLanguageCodesFromStored(input: unknown): string[] | undefined {
  return Array.isArray(input) && input.every((value) => typeof value === 'string') ? input.map((value) => value.trim()).filter(Boolean) : undefined;
}

export function normalizeDateValue(value: string | null | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.getTime();
}

export function sanitizeStoredReviewQueueItem(raw: unknown): ReviewQueueItem | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const id = normalizeTextValue(item.id as string);

  if (!id) {
    return null;
  }

  const itemRecord: ReviewQueueItem = {
    id,
    title: normalizeTextValue(item.title as string) || `Review ${id}`,
    owner: normalizeTextValue(item.owner as string) || 'Review Queue',
    status: normalizeTextValue(item.status as string) || 'In Review',
    risk: normalizeBoardRisk(item.risk as string),
    category: normalizeTextValue(item.category as string) || 'Legal advisory',
    due: normalizeTextValue(item.due as string) || 'Just now',
    workflowId: normalizeTextValue(item.workflowId as string),
    publishingId: normalizeTextValue(item.publishingId as string),
    createdBy:
      normalizeTextValue(item.createdBy as string) ||
      getFirstDefinedMetadataText(item, ['created_by', 'creator', 'creatorName', 'created_by_name', 'creator_name']),
    approvalRecommendation: normalizeTextValue(item.approvalRecommendation as string),
    approvalSummary: normalizeTextValue(item.approvalSummary as string),
    assetComposerStatus: normalizeTextValue(item.assetComposerStatus as string),
    assetLayoutPlan: normalizeLanguageCodesFromStored(item.assetLayoutPlan),
    brandVoice: normalizeTextValue(item.brandVoice as string),
    citationStrictness: normalizeTextValue(item.citationStrictness as string),
    contentGoal: normalizeTextValue(item.contentGoal as string),
    cta: normalizeTextValue(item.cta as string),
    creativeSummary: normalizeTextValue(item.creativeSummary as string),
    degradedMessage: normalizeTextValue(item.degradedMessage as string),
    imageCount: typeof item.imageCount === 'number' ? item.imageCount : undefined,
    issuesFound: normalizeLanguageCodesFromStored(item.issuesFound),
    languages: normalizeLanguageCodesFromStored(item.languages),
    layout: normalizeTextValue(item.layout as string),
    mode: item.mode === 'manual' || item.mode === 'quick' ? item.mode : undefined,
    platforms: normalizeLanguageCodesFromStored(item.platforms),
    postCount: typeof item.postCount === 'number' ? item.postCount : undefined,
    readinessStatus: normalizeTextValue(item.readinessStatus as string),
    requiredFix: normalizeTextValue(item.requiredFix as string),
    selectedAssets: normalizeLanguageCodesFromStored(item.selectedAssets),
    generatedAssets: mapGeneratedAssetsFromMetadata(item.generatedAssets),
    sourceConnectors: normalizeLanguageCodesFromStored(item.sourceConnectors),
    targetAudience: normalizeTextValue(item.targetAudience as string),
    visualBrief: normalizeTextValue(item.visualBrief as string),
    createdAt:
      typeof item.createdAt === 'number' && Number.isFinite(item.createdAt)
        ? item.createdAt
        : normalizeDateValue(typeof item.createdAt === 'string' ? item.createdAt : ''),
    wordCount: typeof item.wordCount === 'number' ? item.wordCount : undefined,
    sourceIds: normalizeSourceIdsFromStored(item.sourceIds),
    generatedDrafts: Array.isArray(item.generatedDrafts)
      ? (item.generatedDrafts as Array<{ languageCode?: string; languageLabel?: string; title?: string; body?: string }>)
          .map((draft) => ({
            languageCode:
              draft?.languageCode === 'th' || draft?.languageCode === 'en' || draft?.languageCode === 'zh' || draft?.languageCode === 'ja'
                ? draft.languageCode
                : 'th',
            languageLabel: draft?.languageLabel || 'Thai',
            title: normalizeTextValue(draft?.title) || 'Draft',
            body: normalizeTextValue(draft?.body) || '',
          }) as GeneratedDraft)
          .filter((draft) => draft.title || draft.body)
      : undefined,
  };

  if (!itemRecord.workflowId && !itemRecord.publishingId) {
    return null;
  }

  return itemRecord;
}

export function readStoredReviewQueueItems({ allowMock } = { allowMock: true }): ReviewQueueItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  if (!allowMock) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(REVIEW_QUEUE_LOCAL_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const sanitized = parsed.map(sanitizeStoredReviewQueueItem).filter((item): item is ReviewQueueItem => Boolean(item));

    if (sanitized.length !== parsed.length) {
      window.localStorage.setItem(REVIEW_QUEUE_LOCAL_STORAGE_KEY, JSON.stringify(sanitized.slice(0, 80)));
    }

    return sanitized;
  } catch {
    return [];
  }
}

export function isGenericReviewTitle(title: string): boolean {
  const normalized = normalizeTextValue(title).toLowerCase();

  if (!normalized) {
    return true;
  }

  if (normalized === 'review package') {
    return true;
  }

  return /^review(\s+review)?\s*#/.test(normalized) || normalized === 'review' || normalized === 'needs review';
}



export function persistReviewQueueItems(items: ReviewQueueItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(REVIEW_QUEUE_LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, 80)));
  } catch {
    // no-op if localStorage is unavailable
  }
}
