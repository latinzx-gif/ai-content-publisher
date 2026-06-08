import type { SupabaseClient } from '@supabase/supabase-js';
import { resetDownstreamWorkflowMetadata } from '@/lib/agents/contentWorkflowMetadata';
import { queueAgentRun } from '@/lib/server/agentQueue';

type ReviewRequeueAction = 'reject' | 'request_changes';

type ContentItemForRequeue = {
  id: string;
  title: string;
  brief: string | null;
  category: string | null;
  service_area: string | null;
  risk_level: 'low' | 'medium' | 'high';
  metadata: Record<string, unknown> | null;
};

export async function queueDraftRevisionFromReview({
  supabase,
  actorProfileId,
  contentItemId,
  reviewItemId,
  action,
  reason,
  triggerSource,
}: {
  supabase: SupabaseClient;
  actorProfileId: string;
  contentItemId: string;
  reviewItemId: string;
  action: ReviewRequeueAction;
  reason: string;
  triggerSource: string;
}) {
  const { data: contentItem, error: contentError } = await supabase
    .from('content_items')
    .select('id,title,brief,category,service_area,risk_level,metadata')
    .eq('id', contentItemId)
    .single<ContentItemForRequeue>();

  if (contentError) {
    throw new Error(contentError.message);
  }

  const revisionRequestedAt = new Date().toISOString();
  const nextMetadata = resetDownstreamWorkflowMetadata(contentItem.metadata, {
    revisionRequest: {
      action,
      reason,
      requestedAt: revisionRequestedAt,
      requestedBy: actorProfileId,
      reviewItemId,
    },
  });

  const { error: updateError } = await supabase
    .from('content_items')
    .update({
      status: 'generating',
      metadata: nextMetadata,
    })
    .eq('id', contentItem.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const metadata = contentItem.metadata ?? {};
  const queued = await queueAgentRun({
    supabase,
    taskType: 'draft_generation',
    riskLevel: contentItem.risk_level,
    targetId: contentItem.id,
    triggerSource,
    input: {
      contentJobId: contentItem.id,
      fromReviewItemId: reviewItemId,
      reviewAction: action,
      reviewFeedback: reason,
      title: contentItem.title,
      brief: contentItem.brief ?? '',
      category: contentItem.category ?? contentItem.service_area ?? null,
      languages: Array.isArray(metadata.languages) ? metadata.languages : ['th', 'en'],
      platforms: Array.isArray(metadata.platforms) ? metadata.platforms : [],
      sourcePolicy: typeof metadata.sourcePolicy === 'string' ? metadata.sourcePolicy : 'citation_preferred',
      layout: typeof metadata.layout === 'string' ? metadata.layout : null,
      imageCount: typeof metadata.imageCount === 'number' ? metadata.imageCount : null,
      selectedAssets: Array.isArray(metadata.selectedAssets) ? metadata.selectedAssets : [],
      assetLayoutPlan: Array.isArray(metadata.assetLayoutPlan) ? metadata.assetLayoutPlan : [],
      facebookLayoutRule:
        metadata.facebookLayoutRule && typeof metadata.facebookLayoutRule === 'object' && !Array.isArray(metadata.facebookLayoutRule)
          ? metadata.facebookLayoutRule
          : null,
    },
  });

  return {
    queuedRunId: queued.run.id,
    queuedAgent: queued.agent.name,
    contentItemId: contentItem.id,
  };
}
