import { NextResponse } from 'next/server';
import { requireFeature } from '@/lib/entitlements/guards';
import { requireApiActor, requireContentAccess, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type GetQuery = {
  status?: string;
};

type UpdateQueueBody = {
  queueId?: string;
  platform?: string;
  status?: 'queued' | 'ready' | 'syncing' | 'published' | 'failed' | 'cancelled';
  scheduledAt?: string;
};

type QueuePostBody = {
  reviewItemId?: string;
  contentItemId?: string;
  platforms?: string[];
  platform?: string;
  scheduledAt?: string;
  reason?: string;
};

type CreatedQueueItem = { id: string; platform: string; status: QueueStatus };

const allowedStatuses = ['queued', 'ready', 'syncing', 'published', 'failed', 'cancelled'] as const;
type QueueStatus = (typeof allowedStatuses)[number];
const allowedPlatforms = ['LinkedIn', 'Facebook', 'WordPress', 'Email Newsletter', 'Instagram', 'YouTube', 'TikTok', 'Buffer'] as const;
type QueuePlatform = (typeof allowedPlatforms)[number];

const allowedActiveQueueStatuses = new Set<QueueStatus>(['queued', 'ready', 'syncing', 'failed', 'published']);

function normalizeQueuePlatform(value: string): QueuePlatform | null {
  switch (value.toLowerCase().trim()) {
    case 'linkedin':
      return 'LinkedIn';
    case 'facebook':
      return 'Facebook';
    case 'wordpress':
      return 'WordPress';
    case 'emailnewsletter':
    case 'email_newsletter':
    case 'email newsletter':
      return 'Email Newsletter';
    case 'instagram':
      return 'Instagram';
    case 'youtube':
      return 'YouTube';
    case 'tiktok':
      return 'TikTok';
    case 'buffer':
      return 'Buffer';
    default:
      return null;
  }
}

function dedupe<T>(values: T[]) {
  return [...new Set(values)];
}

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireTeamPermission(supabase, actor, 'can_publish');

    if (forbidden) {
      return forbidden;
    }

    const { status } = extractGetQuery(request.url);

    let query = supabase
      .from('publishing_queue')
      .select('id,content_item_id,platform,status,scheduled_at,created_at,updated_at,content_items(id,title,service_area)')
      .order('scheduled_at', { ascending: true, nullsFirst: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: queue, error: queueError } = await query;

    if (queueError) {
      throw new Error(queueError.message);
    }

    const { data: errors, error: errorLogError } = await supabase
      .from('publishing_errors')
      .select('id,error_code,message,created_at,publishing_job_id')
      .order('created_at', { ascending: false })
      .limit(30);

    if (errorLogError) {
      throw new Error(errorLogError.message);
    }

    const { data: jobs, error: jobsError } = await supabase
      .from('publishing_jobs')
      .select('id,publishing_queue_id,status,external_post_id,attempt_count,started_at,completed_at,created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobsError) {
      throw new Error(jobsError.message);
    }

    const { data: integrations, error: integrationsError } = await supabase
      .from('integration_accounts')
      .select('id,account_name,external_account_id,status,scopes,last_sync_at,metadata,integrations(provider,display_name)')
      .order('last_sync_at', { ascending: false, nullsFirst: false });

    if (integrationsError) {
      throw new Error(integrationsError.message);
    }

    return NextResponse.json({
      queue: queue ?? [],
      errors: errors ?? [],
      jobs: jobs ?? [],
      integrations: integrations ?? [],
      summary: summarizeQueueStatus(queue ?? []),
    });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Publishing queue query failed',
      source: 'publishing_queue_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireTeamPermission(supabase, actor, 'can_publish');

    if (forbidden) {
      return forbidden;
    }

    const publishingLocked = await requireFeature('publishing_integrations');

    if (publishingLocked) {
      return publishingLocked;
    }

    const body = (await request.json()) as UpdateQueueBody;

    if (!body.queueId) {
      return NextResponse.json({ error: 'queueId is required' }, { status: 400 });
    }

    if (body.platform && !isQueuePlatform(body.platform)) {
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
    }

    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Unsupported status' }, { status: 400 });
    }

    if (body.scheduledAt && !isIsoDateTime(body.scheduledAt)) {
      return NextResponse.json({ error: 'scheduledAt must be a valid ISO date string' }, { status: 400 });
    }

    const update: Record<string, unknown> = {};

    if (body.platform) {
      update.platform = body.platform;
    }

    if (body.status) {
      update.status = body.status;
    }

    if (body.scheduledAt) {
      update.scheduled_at = new Date(body.scheduledAt).toISOString();
    }

    const { data: updated, error: updateError } = await supabase
      .from('publishing_queue')
      .update(update)
      .eq('id', body.queueId)
      .select('id,content_item_id,platform,status,scheduled_at,created_at,updated_at')
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (!updated) {
      return NextResponse.json({ error: 'Publishing queue item not found' }, { status: 404 });
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'publishing_queue.updated',
      targetType: 'publishing_queue',
      targetId: updated.id,
      metadata: {
        update,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Publishing queue update failed',
      source: 'publishing_queue_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireTeamPermission(supabase, actor, 'can_publish');

    if (forbidden) {
      return forbidden;
    }

    const publishingLocked = await requireFeature('publishing_integrations');

    if (publishingLocked) {
      return publishingLocked;
    }

    const body = (await request.json()) as QueuePostBody;
    const requestedPlatforms = dedupe([...(body.platform ? [body.platform] : []), ...(body.platforms ?? [])]).map(normalizeQueuePlatform).filter(
      (platform): platform is QueuePlatform => Boolean(platform),
    );
    const scheduledAt = body.scheduledAt ?? null;

    if (!body.reviewItemId && !body.contentItemId) {
      return NextResponse.json({ error: 'reviewItemId or contentItemId is required' }, { status: 400 });
    }

    if (requestedPlatforms.length === 0) {
      return NextResponse.json({ error: 'platforms is required and must include supported platforms' }, { status: 400 });
    }

    if (scheduledAt && !isIsoDateTime(scheduledAt)) {
      return NextResponse.json({ error: 'scheduledAt must be a valid ISO date string' }, { status: 400 });
    }

    const reviewItemId = body.reviewItemId ?? null;
    let contentItemId = body.contentItemId ?? null;

    if (reviewItemId) {
      const { data: reviewItem, error: reviewError } = await supabase
        .from('review_items')
        .select('id, content_item_id, status')
        .eq('id', reviewItemId)
        .single();

      if (reviewError) {
        throw new Error(reviewError.message);
      }

      if (!reviewItem) {
        return NextResponse.json({ error: 'Review item not found' }, { status: 404 });
      }

      if (reviewItem.status !== 'approved') {
        return NextResponse.json({ error: 'Review item must be approved before publishing queue handoff' }, { status: 409 });
      }

      contentItemId = reviewItem.content_item_id;
    }

    if (!contentItemId) {
      return NextResponse.json({ error: 'contentItemId is required when reviewItemId is not provided' }, { status: 400 });
    }

    const inaccessible = await requireContentAccess(supabase, actor, contentItemId);

    if (inaccessible) {
      return inaccessible;
    }

    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select('id,title,status')
      .eq('id', contentItemId)
      .single();

    if (contentError) {
      throw new Error(contentError.message);
    }

    if (!contentItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    }

    if (!['approved', 'scheduled'].includes(contentItem.status)) {
      return NextResponse.json({ error: 'Content item must be approved before publishing queue handoff' }, { status: 409 });
    }

    const { data: existingQueue, error: existingQueueError } = await supabase
      .from('publishing_queue')
      .select('id,platform,status')
      .eq('content_item_id', contentItem.id);

    if (existingQueueError) {
      throw new Error(existingQueueError.message);
    }

    const activeQueueByPlatform = new Map(
      (existingQueue ?? [])
        .filter((row) => allowedActiveQueueStatuses.has(row.status as QueueStatus))
        .map((row) => [row.platform, row.id]),
    );

    const normalizedScheduledAt = scheduledAt ? new Date(scheduledAt).toISOString() : null;
    const queuePayload: Array<{ content_item_id: string; platform: QueuePlatform; status: 'queued'; created_by: string; scheduled_at: string | null }> = [];
    const skippedPlatforms: string[] = [];

    for (const platform of requestedPlatforms) {
      if (activeQueueByPlatform.has(platform)) {
        skippedPlatforms.push(platform);
        continue;
      }

      queuePayload.push({
        content_item_id: contentItem.id,
        platform,
        status: 'queued',
        created_by: actor.profileId,
        scheduled_at: normalizedScheduledAt,
      });
    }

    if (contentItem.status === 'approved') {
      const { error: contentUpdateError } = await supabase.from('content_items').update({ status: 'scheduled' }).eq('id', contentItem.id);

      if (contentUpdateError) {
        throw new Error(contentUpdateError.message);
      }
    }

    const created: CreatedQueueItem[] = [];

    if (queuePayload.length) {
      const { data: queueRows, error: insertQueueError } = await supabase
        .from('publishing_queue')
        .insert(queuePayload)
        .select('id, platform, status');

      if (insertQueueError) {
        throw new Error(insertQueueError.message);
      }

      created.push(...(queueRows ?? []).map((row) => ({ id: row.id, platform: row.platform, status: row.status as QueueStatus })));
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'review.auto_queue',
      targetType: 'review_item',
      targetId: reviewItemId,
      metadata: {
        contract: 'POST /api/publishing/queue',
        contentItemId: contentItem.id,
        queueIds: created.map((entry) => entry.id),
        skippedPlatforms,
        platformCount: created.length,
        requestedPlatforms,
        reason: body.reason ?? null,
      },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'workflow.review_auto_queue',
      source: 'publishing_queue_api',
      status: created.length ? 'queued' : 'resolved',
      targetType: 'content_item',
      targetId: contentItem.id,
      message: created.length
        ? `Auto queueed ${contentItem.title} to publishing for ${created.length} platform(s).`
        : 'Auto queue request skipped due to existing publishing queues.',
      metadata: {
        contentItemId: contentItem.id,
        requestReviewItemId: reviewItemId,
        requestedPlatforms,
        queuedPlatforms: created.map((entry) => entry.platform),
        skippedPlatforms,
      },
    });

    return NextResponse.json({
      reviewItemId,
      contentItemId: contentItem.id,
      contentTitle: contentItem.title,
      queued: created,
      skippedPlatforms,
    });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Publishing queue create failed',
      source: 'publishing_queue_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function summarizeQueueStatus(queue: Array<{ status: string }>) {
  const statusSummary = Object.fromEntries(allowedStatuses.map((status) => [status, 0])) as Record<QueueStatus, number>;

  queue.forEach((row) => {
    if (allowedStatuses.includes(row.status as QueueStatus)) {
      statusSummary[row.status as QueueStatus] += 1;
    }
  });

  return {
    total: queue.length,
    ...statusSummary,
  };
}

function extractGetQuery(url: string): GetQuery {
  const parsed = new URL(url);
  const params = parsed.searchParams;
  const status = params.get('status')?.toLowerCase();
  const filtered = allowedStatuses.includes(status as QueueStatus) ? status : undefined;

  return { status: filtered };
}

function isQueuePlatform(platform: string): platform is QueuePlatform {
  return (allowedPlatforms as readonly string[]).includes(platform);
}

function isIsoDateTime(value: string) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}
