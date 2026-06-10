import type { ReviewDecision } from '@/features/prd/types/review-queue';

export function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function toReviewDecisionApiValue(decision: ReviewDecision) {
  if (decision === 'queued') {
    return 'auto_queue';
  }

  return decision === 'approved' ? 'approve' : 'reject';
}

export function toPublishingApiPlatform(value: string | undefined) {
  switch ((value ?? '').toLowerCase()) {
    case 'facebook':
      return 'facebook';
    case 'wordpress':
      return 'wordpress';
    case 'newsletter':
    case 'email newsletter':
      return 'email_newsletter';
    case 'buffer':
      return 'buffer';
    case 'instagram':
      return 'instagram';
    case 'youtube':
      return 'youtube';
    case 'tiktok':
      return 'tiktok';
    default:
      return 'linkedin';
  }
}
