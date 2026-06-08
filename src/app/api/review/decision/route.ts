import { NextResponse } from 'next/server';
import { requireFeature } from '@/lib/entitlements/guards';
import { requireApiActor, requireContentAccess, requireReviewQueueMoveAuthority, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { queueDraftRevisionFromReview } from '@/lib/server/reviewRequeue';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ReviewDecisionBody = {
  reviewItemId?: string;
  decision?: 'approve' | 'reject' | 'request_changes' | 'auto_queue';
  reason?: string;
  platform?: string;
  scheduledAt?: string;
};

const decisions = ['approve', 'reject', 'request_changes', 'auto_queue'] as const;
const publishingPlatforms = ['linkedin', 'facebook', 'wordpress', 'email_newsletter', 'buffer', 'instagram', 'youtube', 'tiktok'] as const;
type PublishingPlatform = (typeof publishingPlatforms)[number];

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const body = (await request.json()) as ReviewDecisionBody;

    if (!body.reviewItemId || !body.decision) {
      return NextResponse.json({ error: 'reviewItemId and decision are required' }, { status: 400 });
    }

    if (!decisions.includes(body.decision)) {
      return NextResponse.json({ error: 'decision must be approve, reject, request_changes, or auto_queue' }, { status: 400 });
    }

    if ((body.decision === 'reject' || body.decision === 'request_changes') && !body.reason?.trim()) {
      return NextResponse.json({ error: 'reason is required for reject or request_changes' }, { status: 400 });
    }

    if (body.platform && !isPublishingPlatform(body.platform)) {
      return NextResponse.json({ error: 'Unsupported publishing platform' }, { status: 400 });
    }

    if (body.scheduledAt && !isIsoDateTime(body.scheduledAt)) {
      return NextResponse.json({ error: 'scheduledAt must be a valid ISO date string' }, { status: 400 });
    }

    const permission = body.decision === 'auto_queue' ? 'can_publish' : body.decision === 'approve' ? 'can_approve' : 'can_review';
    const forbidden = await requireTeamPermission(supabase, actor, permission);

    if (forbidden) {
      return forbidden;
    }

    if (body.decision === 'auto_queue') {
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

    const { data: result, error: decisionError } = await supabase.rpc('apply_review_action', {
      p_review_item_id: reviewItem.id,
      p_action: body.decision,
      p_actor_profile_id: actor.profileId,
      p_note: body.reason ?? null,
      p_platform: body.platform ?? null,
      p_scheduled_at: body.scheduledAt ?? null,
    });

    if (decisionError) {
      if (decisionError.message.includes('Content must be approved before auto queue')) {
        return NextResponse.json({ error: decisionError.message }, { status: 409 });
      }

      throw new Error(decisionError.message);
    }

    let revisionQueue: { queuedRunId: string; queuedAgent: string; contentItemId: string } | null = null;

    if (body.decision === 'reject' || body.decision === 'request_changes') {
      revisionQueue = await queueDraftRevisionFromReview({
        supabase,
        actorProfileId: actor.profileId,
        contentItemId: reviewItem.content_item_id,
        reviewItemId: reviewItem.id,
        action: body.decision,
        reason: body.reason?.trim() ?? 'Revision requested from Review Queue.',
        triggerSource: 'review_decision_api',
      });
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: `review.decision.${body.decision}`,
      targetType: 'review_item',
      targetId: reviewItem.id,
      metadata: {
        contract: 'POST /api/review/decision',
        contentItemId: reviewItem.content_item_id,
        reason: body.reason ?? null,
        publishingQueueId: result?.queue?.id ?? null,
        revisionQueue,
      },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'workflow.review_decision',
      source: 'review_decision_api',
      status: body.decision === 'reject' ? 'open' : 'succeeded',
      targetType: 'review_item',
      targetId: reviewItem.id,
      message: `Review decision recorded: ${body.decision}.`,
      metadata: {
        contentItemId: reviewItem.content_item_id,
        decision: body.decision,
        reason: body.reason ?? null,
        revisionQueue,
      },
    });

    return NextResponse.json({ ...result, revisionQueue });
  } catch (error) {
    await writeSystemLogBestEffort(supabase, {
      eventType: 'review.decision_failed',
      source: 'review_decision_api',
      severity: 'high',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Review decision failed',
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
