import {
  APP_TIMEZONE,
  APP_TIMEZONE_OFFSET,
  toAppDateKey,
  toBangkokDateParts,
  toDateParts,
} from '@/features/prd/lib/calendar-display';
import type {
  PublishingApiResponse,
  PublishingChannelSummary,
  PublishingErrorRow,
  PublishingIntegrationApiRow,
  PublishingQueueRow,
} from '@/features/prd/types/api';

export const fallbackPublishingChannels: PublishingChannelSummary[] = [];
export const fallbackPublishingQueue: PublishingQueueRow[] = [];
export const fallbackPublishingErrors: PublishingErrorRow[] = [];

export function capitalizeQueueStatus(status: string): PublishingQueueRow['status'] {
  switch ((status ?? '').toLowerCase()) {
    case 'ready':
      return 'Ready';
    case 'syncing':
      return 'Syncing';
    case 'published':
      return 'Published';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Queued';
  }
}

export function formatQueueTime(value: string | null) {
  if (!value) {
    return 'Unscheduled';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unscheduled';
  }

  const base = new Date();
  const baseThaiParts = toBangkokDateParts(base);
  if (baseThaiParts) {
    const tomorrowThai = new Date(
      `${baseThaiParts.year}-${toDateParts(baseThaiParts.month)}-${toDateParts(baseThaiParts.day)}T00:00:00${APP_TIMEZONE_OFFSET}`,
    );
    tomorrowThai.setDate(tomorrowThai.getDate() + 1);
    const sameDay = toAppDateKey(parsed) === toAppDateKey(base);
    const sameTomorrow = toAppDateKey(parsed) === toAppDateKey(tomorrowThai);

    const time = parsed.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: APP_TIMEZONE,
    });
    if (sameDay) {
      return `Today ${time}`;
    }

    if (sameTomorrow) {
      return `Tomorrow ${time}`;
    }
  }

  const time = parsed.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIMEZONE,
  });

  return `${parsed.toLocaleDateString('en-GB', {
    month: 'short',
    day: '2-digit',
    timeZone: APP_TIMEZONE,
  })} ${time}`;
}

export function minutesAgo(value: string | null | undefined) {
  if (!value) {
    return 'No activity';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'No activity';
  }

  const deltaMinutes = Math.max(0, Math.round((Date.now() - parsed.getTime()) / 60000));

  return `${deltaMinutes} min ago`;
}

export function getPublishingIntegrationMeta(row: PublishingIntegrationApiRow) {
  const integration = Array.isArray(row.integrations) ? row.integrations[0] : row.integrations;
  return integration ?? null;
}

export function providerToPublishingChannel(provider: string, displayName: string | undefined) {
  switch (provider) {
    case 'facebook':
      return 'Facebook';
    case 'buffer':
      return 'Buffer';
    case 'wordpress':
      return 'WordPress';
    case 'email_newsletter':
      return 'Email Newsletter';
    case 'instagram':
      return 'Instagram';
    case 'youtube':
      return 'YouTube';
    case 'tiktok':
      return 'TikTok';
    default:
      return displayName ?? provider;
  }
}

export function formatIntegrationHealth(status: string) {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'expired':
      return 'Token expired';
    case 'failed':
      return 'Needs attention';
    case 'disconnected':
      return 'Disconnected';
    default:
      return 'Not connected';
  }
}

export function mapPublishingPayload(data: PublishingApiResponse) {
  const platformMap = new Map<string, { queue: number; lastUpdated: string | null; hasFailed: boolean }>();
  const jobMap = new Map((data.jobs ?? []).map((job) => [job.id, job]));
  const queueMap = new Map(data.queue.map((row) => [row.id, row]));
  const integrationMap = new Map<string, PublishingIntegrationApiRow>();

  (data.integrations ?? []).forEach((row) => {
    const integration = getPublishingIntegrationMeta(row);
    if (!integration) {
      return;
    }

    integrationMap.set(providerToPublishingChannel(integration.provider, integration.display_name), row);
  });

  data.queue.forEach((row) => {
    const current = platformMap.get(row.platform) ?? { queue: 0, lastUpdated: null, hasFailed: false };
    current.queue += 1;
    const compareWith = row.updated_at || row.created_at;
    if (!current.lastUpdated || (compareWith && compareWith > current.lastUpdated)) {
      current.lastUpdated = compareWith;
    }
    if (row.status === 'failed') {
      current.hasFailed = true;
    }
    platformMap.set(row.platform, current);
  });

  const channelMap: PublishingChannelSummary[] = fallbackPublishingChannels.map((channel) => {
    const summary = platformMap.get(channel.name);
    const integration = integrationMap.get(channel.name);
    const sync = integration?.last_sync_at ? `Last sync ${minutesAgo(integration.last_sync_at)}` : summary?.lastUpdated ? `Last queue update ${minutesAgo(summary.lastUpdated)}` : 'No recent jobs';
    const health = integration ? formatIntegrationHealth(integration.status) : summary ? 'Queue only' : 'Not connected';
    const hasFailed = summary?.hasFailed || integration?.status === 'expired' || integration?.status === 'failed';

    if (!summary) {
      return {
        ...channel,
        queue: 0,
        status: hasFailed ? 'Failed' : 'Success',
        sync,
        health,
      };
    }

    return {
      ...channel,
      queue: summary.queue,
      status: hasFailed ? 'Failed' : 'Success',
      sync,
      health: hasFailed ? health === 'Connected' ? 'Needs attention' : health : health,
    };
  });

  return {
    channels: channelMap,
    queue: data.queue.map((row) => ({
      id: row.id,
      title: row.content_items?.title ?? 'Untitled content',
      platform: row.platform,
      time: formatQueueTime(row.scheduled_at),
      status: capitalizeQueueStatus(row.status),
    })),
    errors: data.errors.slice(0, 4).map((row) => {
      const jobEntry = row.publishing_job_id ? jobMap.get(row.publishing_job_id) : undefined;
      const queueEntry = jobEntry ? queueMap.get(jobEntry.publishing_queue_id) : undefined;
      return {
        time: new Date(row.created_at).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: APP_TIMEZONE,
        }),
        platform: queueEntry?.platform ?? 'System',
        message: `${row.error_code ? `[${row.error_code}] ` : ''}${row.message ?? 'Unknown publishing error'}`,
      };
    }),
    summary: data.summary,
  };
}
