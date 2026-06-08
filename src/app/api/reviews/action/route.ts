import { NextResponse } from 'next/server';
import { requireFeature } from '@/lib/entitlements/guards';
import { requireApiActor, requireContentAccess, requireReviewQueueMoveAuthority, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { queueDraftRevisionFromReview } from '@/lib/server/reviewRequeue';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ReviewActionBody = {
  reviewItemId?: string;
  action?: 'approve' | 'reject' | 'request_changes' | 'auto_queue';
  note?: string;
  platform?: string;
  scheduledAt?: string;
};

const reviewActions = ['approve', 'reject', 'request_changes', 'auto_queue'] as const;
const publishingPlatforms = ['linkedin', 'facebook', 'wordpress', 'email_newsletter', 'buffer', 'instagram', 'youtube', 'tiktok'] as const;

type PublishingPlatform = (typeof publishingPlatforms)[number];

const reviewStatusByAction = {
  approve: 'approved',
  reject: 'rejected',
  request_changes: 'changes_requested',
  auto_queue: 'approved',
} as const;

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const body = (await request.json()) as ReviewActionBody;

    if (!body.reviewItemId || !body.action) {
      return NextResponse.json({ error: 'reviewItemId and action are required' }, { status: 400 });
    }

    if (!reviewActions.includes(body.action)) {
      return NextResponse.json({ error: 'action must be approve, reject, request_changes, or auto_queue' }, { status: 400 });
    }

    if ((body.action === 'reject' || body.action === 'request_changes') && !body.note?.trim()) {
      return NextResponse.json({ error: 'note is required for reject or request_changes' }, { status: 400 });
    }

    if (body.platform && !isPublishingPlatform(body.platform)) {
      return NextResponse.json({ error: 'Unsupported publishing platform' }, { status: 400 });
    }

    if (body.scheduledAt && !isIsoDateTime(body.scheduledAt)) {
      return NextResponse.json({ error: 'scheduledAt must be a valid ISO date string' }, { status: 400 });
    }

    const action = body.action;
    const permission = action === 'auto_queue' ? 'can_publish' : action === 'approve' ? 'can_approve' : 'can_review';
    const forbidden = await requireTeamPermission(supabase, actor, permission);

    if (forbidden) {
      return forbidden;
    }

    if (action === 'auto_queue') {
      const publishingLocked = await requireFeature('publishing_integrations');

      if (publishingLocked) {
        return publishingLocked;
      }
    }

    const { data: reviewItem, error: reviewError } = await supabase
      .from('review_items')
      .select('id, content_item_id, status')
      .eq('id', body.reviewItemId)
      .single();

    if (reviewError) {
      throw new Error(reviewError.message);
    }

    const inaccessible = await requireContentAccess(supabase, actor, reviewItem.content_item_id);

    if (inaccessible) {
      return inaccessible;
    }

    if (reviewItem.status === 'in_review') {
      const cannotMoveFromReviewQueue = await requireReviewQueueMoveAuthority(supabase, actor);

      if (cannotMoveFromReviewQueue) {
        return cannotMoveFromReviewQueue;
      }
    }

    const { data: result, error: actionError } = await supabase.rpc('apply_review_action', {
      p_review_item_id: reviewItem.id,
      p_action: action,
      p_actor_profile_id: actor.profileId,
      p_note: body.note ?? null,
      p_platform: body.platform ?? null,
      p_scheduled_at: body.scheduledAt ?? null,
    });

    if (actionError) {
      if (actionError.message.includes('Content must be approved before auto queue')) {
        return NextResponse.json({ error: actionError.message }, { status: 409 });
      }

      throw new Error(actionError.message);
    }

    let revisionQueue: { queuedRunId: string; queuedAgent: string; contentItemId: string } | null = null;

    if (action === 'reject' || action === 'request_changes') {
      revisionQueue = await queueDraftRevisionFromReview({
        supabase,
        actorProfileId: actor.profileId,
        contentItemId: reviewItem.content_item_id,
        reviewItemId: reviewItem.id,
        action,
        reason: body.note?.trim() ?? 'Revision requested from Review Queue.',
        triggerSource: 'review_action_api',
      });
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: `review.${action}`,
      targetType: 'review_item',
      targetId: reviewItem.id,
      metadata: {
        contentItemId: reviewItem.content_item_id,
        approvalEventId: result?.approvalEvent?.id ?? null,
        publishingQueueId: result?.queue?.id ?? null,
        reviewStatus: reviewStatusByAction[action],
        revisionQueue,
      },
    });

    return NextResponse.json({ ...result, revisionQueue });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Review action failed',
      source: 'review_action_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function isPublishingPlatform(platform: string): platform is PublishingPlatform {
  return publishingPlatforms.includes(platform as PublishingPlatform);
}

function isIsoDateTime(value: string) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}
