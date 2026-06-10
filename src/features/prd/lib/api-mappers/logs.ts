import { APP_TIMEZONE } from '@/features/prd/lib/calendar-display';
import type { LogsApiResponse } from '@/features/prd/types/api';
import type { LogEvent } from '@/features/prd/types/logs';

export function normalizeLogSeverity(value: string | null | undefined): LogEvent['severity'] {
  switch ((value ?? '').toLowerCase()) {
    case 'critical':
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    default:
      return 'Low';
  }
}

export function formatLogTime(value: string | null | undefined) {
  if (!value) {
    return 'now';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'now';
  }

  return parsed.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIMEZONE,
  });
}

export function toTimestampString() {
  return new Date().toISOString();
}

export function formatReviewItemDate(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Unknown';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: APP_TIMEZONE,
  }).format(parsed);
}

export function humanizeEventType(value: string) {
  return value
    .replace(/^workflow\./, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function mapLogsPayload(data: LogsApiResponse): LogEvent[] {
  const systemEvents = data.systemLogs.map((row) => {
    const presentation = row.presentation ?? null;
    const presentationSource = typeof presentation?.agent_name === 'string' ? presentation.agent_name : undefined;
    const presentationReadableMessage = typeof presentation?.readable_message === 'string' ? presentation.readable_message : undefined;
    const presentationSummary = typeof presentation?.user_facing_summary === 'string' ? presentation.user_facing_summary : undefined;
    const presentationRelatedId = typeof presentation?.related_id === 'string' ? presentation.related_id : undefined;
    const presentationStatus = typeof presentation?.status === 'string' ? presentation.status : undefined;
    const presentationEventType = typeof presentation?.event_type === 'string' ? presentation.event_type : undefined;
    const presentationTimestamp = typeof presentation?.timestamp === 'string' ? presentation.timestamp : undefined;

    return {
      time: formatLogTime(presentationTimestamp || row.created_at),
      type: humanizeEventType(presentationEventType || row.event_type),
      source: presentationSource || row.source || row.target_type || 'System logs',
      severity: normalizeLogSeverity(row.severity),
      message: presentationReadableMessage || presentationSummary || row.message || row.event_type,
      itemId: presentationRelatedId || row.target_id || undefined,
      relatedId: presentationRelatedId || (typeof row.metadata?.contentItemId === 'string' ? row.metadata.contentItemId : undefined),
      status: presentationStatus || row.status,
    };
  });
  const errorLogEvents = data.errorEvents.map((row) => {
    const presentation = row.presentation ?? null;
    const presentationSource = typeof presentation?.agent_name === 'string' ? presentation.agent_name : undefined;
    const presentationReadableMessage = typeof presentation?.readable_message === 'string' ? presentation.readable_message : undefined;
    const presentationDegradedMessage = typeof presentation?.degraded_message === 'string' ? presentation.degraded_message : undefined;
    const presentationRelatedId = typeof presentation?.related_id === 'string' ? presentation.related_id : undefined;
    const presentationStatus = typeof presentation?.status === 'string' ? presentation.status : undefined;
    const presentationEventType = typeof presentation?.event_type === 'string' ? presentation.event_type : undefined;
    const presentationTimestamp = typeof presentation?.timestamp === 'string' ? presentation.timestamp : undefined;

    return {
      time: formatLogTime(presentationTimestamp || row.created_at),
      type: humanizeEventType(presentationEventType || row.type),
      source: presentationSource || row.source || 'Error monitor',
      severity: normalizeLogSeverity(row.severity),
      message: presentationDegradedMessage || presentationReadableMessage || row.message || row.type,
      itemId: presentationRelatedId || (typeof row.metadata?.contentItemId === 'string' ? row.metadata.contentItemId : undefined),
      relatedId: presentationRelatedId,
      status: presentationStatus || row.status,
    };
  });

  return [...systemEvents, ...errorLogEvents].slice(0, 80);
}
