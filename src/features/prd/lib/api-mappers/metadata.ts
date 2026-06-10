import { normalizeTextValue } from '@/features/prd/lib/text';

export function getFirstDefinedMetadataText(metadata: Record<string, unknown> | null | undefined, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = normalizeTextValue(metadata?.[key] as string | undefined);
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function getFirstDefinedMetadataValue(metadata: Record<string, unknown> | null | undefined, keys: string[]): unknown {
  for (const key of keys) {
    if (metadata && Object.prototype.hasOwnProperty.call(metadata, key)) {
      const value = metadata[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  return undefined;
}

export function parseReviewTimestamp(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = normalizeTextValue(value);
    if (!normalized) {
      return undefined;
    }

    const parsedNumber = Number(normalized);
    if (Number.isFinite(parsedNumber)) {
      return parsedNumber;
    }

    const timeOnlyMatch = normalized.match(/^(\\d{1,2}):(\\d{2})(?::(\\d{2}))?$/);
    if (timeOnlyMatch) {
      const hour = Number(timeOnlyMatch[1]);
      const minute = Number(timeOnlyMatch[2]);
      const second = Number(timeOnlyMatch[3] || '0');

      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59) {
        const parsed = new Date();
        parsed.setHours(hour, minute, second, 0);
        return parsed.getTime();
      }
    }

    const parsedDate = new Date(normalized);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.getTime();
  }

  if (typeof value === 'bigint' && Number.isFinite(Number(value))) {
    return Number(value);
  }

  return undefined;
}

export type JwtTokenPayload = {
  email?: string;
  name?: string;
  username?: string;
  user_name?: string;
  user_metadata?: {
    full_name?: string;
    fullName?: string;
    name?: string;
    username?: string;
    [key: string]: unknown;
  };
};

export function decodeJwtPayload(token: string): JwtTokenPayload | null {
  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  const encodedPayload = parts[1];
  const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;

  try {
    const decodedPayload = atob(padded);
    return JSON.parse(decodedPayload) as JwtTokenPayload;
  } catch {
    return null;
  }
}

export function extractActorDisplayNameFromToken(token: string): string {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return '';
  }

  const userMetadata = payload.user_metadata ?? {};
  const emailPrefix = normalizeTextValue(payload.email ?? '').split('@')[0];

  const candidates = [
    normalizeTextValue(payload.name),
    normalizeTextValue(payload.user_name),
    normalizeTextValue(payload.username),
    normalizeTextValue((userMetadata.full_name as string) ?? ''),
    normalizeTextValue((userMetadata.fullName as string) ?? ''),
    normalizeTextValue((userMetadata.name as string) ?? ''),
    normalizeTextValue((userMetadata.username as string) ?? ''),
    emailPrefix,
  ];

  return candidates.find(Boolean) ?? '';
}

export function buildReviewItemCreator(metadata: Record<string, unknown> | undefined, reviewerName?: string | null) {
  return (
    getFirstDefinedMetadataText(metadata, ['createdBy', 'created_by', 'creator', 'creatorName', 'created_by_name', 'creator_name']) ||
    normalizeTextValue(reviewerName) ||
    undefined
  );
}
