import { NextResponse } from 'next/server';
import { requireFeature } from '@/lib/entitlements/guards';
import { requireApiActor, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type PublishingSyncBody = {
  queueId?: string;
  action?: 'publish_now' | 'mark_syncing' | 'mark_published' | 'mark_failed' | 'cancel';
  externalPostId?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
};

const actions = ['publish_now', 'mark_syncing', 'mark_published', 'mark_failed', 'cancel'] as const;

const statusByAction = {
  publish_now: 'syncing',
  mark_syncing: 'syncing',
  mark_published: 'published',
  mark_failed: 'failed',
  cancel: 'cancelled',
} as const;

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

    const body = (await request.json()) as PublishingSyncBody;

    if (!body.queueId || !body.action) {
      return NextResponse.json({ error: 'queueId and action are required' }, { status: 400 });
    }

    if (!actions.includes(body.action)) {
      return NextResponse.json({ error: 'Unsupported publishing sync action' }, { status: 400 });
    }

    if (body.action === 'mark_failed' && !body.errorMessage?.trim()) {
      return NextResponse.json({ error: 'errorMessage is required when marking failed' }, { status: 400 });
    }

    const { data: queueItem, error: queueError } = await supabase
      .from('publishing_queue')
      .select('id, content_item_id, platform, status')
      .eq('id', body.queueId)
      .single();

    if (queueError) {
      throw new Error(queueError.message);
    }

    const nextStatus = statusByAction[body.action];
    const { data: updatedQueue, error: updateError } = await supabase
      .from('publishing_queue')
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueItem.id)
      .select('id, content_item_id, platform, status, scheduled_at, updated_at')
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { data: publishingJob, error: jobError } = await supabase
      .from('publishing_jobs')
      .insert({
        publishing_queue_id: queueItem.id,
        status: nextStatus === 'syncing' ? 'running' : nextStatus === 'published' ? 'published' : nextStatus === 'failed' ? 'failed' : 'cancelled',
        external_post_id: body.externalPostId ?? null,
        attempt_count: 1,
        started_at: ['publish_now', 'mark_syncing'].includes(body.action) ? new Date().toISOString() : null,
        completed_at: ['mark_published', 'mark_failed', 'cancel'].includes(body.action) ? new Date().toISOString() : null,
      })
      .select('id, status, external_post_id, created_at')
      .single();

    if (jobError) {
      throw new Error(jobError.message);
    }

    if (body.action === 'mark_failed') {
      const { error: publishError } = await supabase.from('publishing_errors').insert({
        publishing_job_id: publishingJob.id,
        error_code: body.errorCode ?? 'sync_failed',
        message: body.errorMessage ?? 'Publishing sync failed',
        metadata: body.metadata ?? {},
      });

      if (publishError) {
        throw new Error(publishError.message);
      }
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: `publishing.sync.${body.action}`,
      targetType: 'publishing_queue',
      targetId: queueItem.id,
      metadata: {
        contract: 'POST /api/publishing/sync',
        contentItemId: queueItem.content_item_id,
        previousStatus: queueItem.status,
        nextStatus,
        publishingJobId: publishingJob.id,
      },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'workflow.publishing_sync',
      source: 'publishing_sync_api',
      severity: nextStatus === 'failed' ? 'high' : 'low',
      status: nextStatus === 'failed' ? 'failed' : 'succeeded',
      targetType: 'publishing_queue',
      targetId: queueItem.id,
      message: `Publishing sync action ${body.action} moved queue item to ${nextStatus}.`,
      metadata: {
        contentItemId: queueItem.content_item_id,
        publishingJobId: publishingJob.id,
        externalPostId: body.externalPostId ?? null,
        errorCode: body.errorCode ?? null,
      },
    });

    return NextResponse.json({
      queue: updatedQueue,
      job: publishingJob,
    });
  } catch (error) {
    await writeSystemLogBestEffort(supabase, {
      eventType: 'publishing.sync_failed',
      source: 'publishing_sync_api',
      severity: 'high',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Publishing sync failed',
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
