import { normalizeTextValue } from '@/features/prd/lib/text';
import {
  getDashboardIdForWorkflowId,
  getPublishingIdForWorkflowId,
  getReviewIdForWorkflowId,
} from '@/features/prd/lib/workflow-ids';
import type { ReviewQueueItem } from '@/features/prd/types/review-queue';

function normalizeDateValue(value: string | null | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.getTime();
}

export function getReviewQueueSortValue(item: ReviewQueueItem): number {
  if (typeof item.createdAt === 'number' && Number.isFinite(item.createdAt)) {
    return item.createdAt;
  }

  const parsedDate = normalizeDateValue(item.due);
  if (typeof parsedDate === 'number' && Number.isFinite(parsedDate)) {
    return parsedDate;
  }

  const sortSourceIds = [item.id, item.workflowId, item.publishingId].filter((value): value is string => Boolean(value));

  for (const sourceId of sortSourceIds) {
    const seed = extractReviewIdSeed(sourceId);
    if (!seed) {
      continue;
    }

    const normalizedSeed = seed.length > 12 ? seed.slice(-12) : seed;
    const parsedSeed = Number(normalizedSeed);
    if (!Number.isNaN(parsedSeed)) {
      return parsedSeed;
    }
  }

  return 0;
}

export function sortReviewQueueItems(items: ReviewQueueItem[]): ReviewQueueItem[] {
  return [...items].sort((a, b) => {
    const aValue = getReviewQueueSortValue(a);
    const bValue = getReviewQueueSortValue(b);

    if (aValue !== bValue) {
      return bValue - aValue;
    }

    return a.id.localeCompare(b.id);
  });
}

export function normalizeReviewQueueId(value: string) {
  return normalizeTextValue(value).toUpperCase();
}

export function extractReviewIdSeed(value: string | undefined | null): string {
  const normalized = normalizeReviewQueueId(value || '');

  return normalized.match(/\d+/g)?.join('') ?? '';
}

export function buildReviewIdMatchSignatures(value: string | undefined | null): Set<string> {
  const normalized = normalizeReviewQueueId(value || '');
  if (!normalized) {
    return new Set();
  }

  const signatures = new Set([normalized, normalized.toLowerCase()]);
  const seed = extractReviewIdSeed(normalized);

  if (!seed) {
    return signatures;
  }

  signatures.add(seed);
  signatures.add(`SW-${seed}`);
  signatures.add(`REV-${seed}`);
  signatures.add(`PUB-${seed}`);

  return signatures;
}

export function getReviewQueueItemMatchSignatures(item: Pick<ReviewQueueItem, 'id' | 'workflowId' | 'publishingId' | 'sourceIds'>) {
  const signatures = new Set<string>();
  const add = (value: string | undefined | null) => {
    buildReviewIdMatchSignatures(value).forEach((signature) => {
      signatures.add(signature);
    });
  };

  add(item.id);
  add(item.workflowId);
  add(item.publishingId);

  item.sourceIds?.forEach((sourceId) => add(sourceId));

  if (item.workflowId) {
    add(getDashboardIdForWorkflowId(item.workflowId));
    add(getReviewIdForWorkflowId(item.workflowId));
    add(getPublishingIdForWorkflowId(item.workflowId));
  }

  return signatures;
}

export function hasReviewQueueTargetMatch(item: Pick<ReviewQueueItem, 'id' | 'workflowId' | 'publishingId'>, targetSignatures: Set<string>) {
  const itemSignatures = getReviewQueueItemMatchSignatures(item);

  return [...targetSignatures].some((signature) => itemSignatures.has(signature));
}

export function hasMatchingSignatures(firstSignatures: Set<string>, secondSignatures: Set<string>) {
  return [...firstSignatures].some((signature) => secondSignatures.has(signature));
}

export function buildReviewQueueTargetMatchSignatures(values: Array<string | undefined | null>) {
  const signatures = new Set<string>();
  values.forEach((value) => {
    buildReviewIdMatchSignatures(value).forEach((signature) => {
      signatures.add(signature);
    });
  });

  return signatures;
}

export function hasReviewQueueValueMatch(value: string | undefined | null, targetSignatures: Set<string>) {
  return hasMatchingSignatures(buildReviewIdMatchSignatures(value), targetSignatures);
}
