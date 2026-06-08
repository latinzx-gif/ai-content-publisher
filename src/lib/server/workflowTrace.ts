import type { SupabaseClient } from '@supabase/supabase-js';

type UnknownRecord = Record<string, unknown>;

type WorkflowAgentRunRow = {
  id: string;
  agent_id: string | null;
  target_id: string | null;
  target_type: string | null;
  status: string;
  input?: UnknownRecord | null;
  output?: UnknownRecord | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
};

type WorkflowAgentRow = {
  id: string;
  name: string;
};

type WorkflowSystemLogRow = {
  id: string;
  event_type: string;
  status: string;
  message: string | null;
  target_type: string | null;
  target_id: string | null;
  metadata?: UnknownRecord | null;
  created_at?: string | null;
};

export type WorkflowTaskTrace = {
  workflow_id: string | null;
  job_id: string | null;
  agent_run_id: string | null;
  target_type: string | null;
  owner_agent: string | null;
  status: string | null;
  status_label: string | null;
  step_label: string | null;
  readable_message: string | null;
  user_facing_summary: string | null;
  related_content_id: string | null;
  related_asset_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  degraded_message: string | null;
  debug?: {
    internal_payload?: UnknownRecord | null;
    raw_output?: UnknownRecord | null;
  };
};

export async function fetchWorkflowTraceMap(
  supabase: SupabaseClient,
  contentItemIds: string[],
): Promise<Map<string, WorkflowTaskTrace[]>> {
  const traceMap = new Map<string, WorkflowTaskTrace[]>();

  if (contentItemIds.length === 0) {
    return traceMap;
  }

  const { data: runs, error: runsError } = await supabase
    .from('agent_runs')
    .select('id,agent_id,target_id,target_type,status,input,output,started_at,completed_at,created_at')
    .in('target_id', contentItemIds)
    .order('created_at', { ascending: false })
    .returns<WorkflowAgentRunRow[]>();

  if (runsError) {
    throw new Error(runsError.message);
  }

  const agentIds = Array.from(new Set((runs ?? []).map((run) => run.agent_id).filter(Boolean))) as string[];
  const agentMap = new Map<string, string>();

  if (agentIds.length > 0) {
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id,name')
      .in('id', agentIds)
      .returns<WorkflowAgentRow[]>();

    if (agentsError) {
      throw new Error(agentsError.message);
    }

    for (const agent of agents ?? []) {
      agentMap.set(agent.id, agent.name);
    }
  }

  for (const run of runs ?? []) {
    const contentItemId = typeof run.target_id === 'string' ? run.target_id : null;
    if (!contentItemId) {
      continue;
    }

    const current = traceMap.get(contentItemId) ?? [];
    current.push(buildWorkflowTraceFromAgentRun(run, agentMap.get(run.agent_id ?? '') ?? null));
    traceMap.set(contentItemId, current);
  }

  return traceMap;
}

export function buildWorkflowTraceFromAgentRun(run: WorkflowAgentRunRow, ownerAgent: string | null): WorkflowTaskTrace {
  const output = normalizeRecord(run.output);
  const metadata = normalizeRecord(output?.metadata);
  const userFacingOutput = normalizeRecord(output?.user_facing_output);
  const internalPayload = normalizeRecord(output?.internal_payload);
  const summary = extractUserFacingSummary(userFacingOutput, output);
  const degradedMessage =
    getText(userFacingOutput, ['degraded_message_if_failed', 'degraded_message']) ||
    getText(metadata, ['degradedMessage', 'degraded_message']) ||
    null;
  const errorMessage =
    getText(metadata, ['errorMessage', 'error_message']) ||
    (typeof run.status === 'string' && run.status === 'failed' ? summary || null : null);
  const targetType = typeof run.target_type === 'string' ? run.target_type : null;
  const relatedContentId = typeof run.target_id === 'string' ? run.target_id : null;

  return {
    workflow_id: relatedContentId,
    job_id: relatedContentId,
    agent_run_id: run.id,
    target_type: targetType,
    owner_agent: ownerAgent,
    status: run.status ?? null,
    status_label: humanizeStatus(run.status),
    step_label: humanizeStepLabel(targetType),
    readable_message: buildTraceMessage(targetType, run.status, ownerAgent),
    user_facing_summary: summary,
    related_content_id: relatedContentId,
    related_asset_id: getText(metadata, ['relatedAssetId', 'related_asset_id']),
    started_at: run.started_at ?? run.created_at ?? null,
    completed_at: run.completed_at ?? null,
    error_message: errorMessage,
    degraded_message: degradedMessage,
    debug: {
      internal_payload: internalPayload,
      raw_output: output,
    },
  };
}

export function buildWorkflowTraceFromSystemLog(row: WorkflowSystemLogRow): WorkflowTaskTrace {
  const metadata = normalizeRecord(row.metadata);
  const targetType =
    getText(metadata, ['destinationTask', 'destination_task', 'taskType', 'task_type', 'targetType', 'target_type']) ||
    row.target_type;
  const relatedContentId =
    getText(metadata, ['contentItemId', 'content_item_id', 'workflowId', 'workflow_id', 'jobId', 'job_id']) ||
    row.target_id ||
    null;

  return {
    workflow_id: relatedContentId,
    job_id: relatedContentId,
    agent_run_id: getText(metadata, ['agentRunId', 'agent_run_id', 'destinationRunId', 'destination_run_id']),
    target_type: targetType,
    owner_agent:
      getText(metadata, ['destinationAgent', 'destination_agent', 'agentName', 'agent_name']) ||
      getText(metadata, ['pipelineOwner', 'pipeline_owner']) ||
      row.target_type,
    status: row.status ?? null,
    status_label: humanizeStatus(row.status),
    step_label: humanizeStepLabel(targetType),
    readable_message: row.message || buildTraceMessage(targetType, row.status, null),
    user_facing_summary:
      getText(metadata, ['userFacingSummary', 'user_facing_summary', 'readableMessage', 'readable_message']) ||
      row.message ||
      null,
    related_content_id: relatedContentId,
    related_asset_id: getText(metadata, ['relatedAssetId', 'related_asset_id']),
    started_at: getText(metadata, ['startedAt', 'started_at', 'assignedAt', 'assigned_at']) || row.created_at || null,
    completed_at: getText(metadata, ['completedAt', 'completed_at']) || null,
    error_message:
      getText(metadata, ['errorMessage', 'error_message']) ||
      (row.status === 'failed' ? row.message : null),
    degraded_message: getText(metadata, ['degradedMessage', 'degraded_message']),
  };
}

function extractUserFacingSummary(userFacingOutput: UnknownRecord | null, output: UnknownRecord | null) {
  return (
    getText(userFacingOutput, ['approval_summary', 'approval_recommendation', 'creative_summary', 'readable_layout_summary', 'summary']) ||
    getText(output, ['summary']) ||
    null
  );
}

function buildTraceMessage(targetType: string | null, status: string | null | undefined, ownerAgent: string | null) {
  const stepLabel = humanizeStepLabel(targetType);
  const statusLabel = humanizeStatus(status);

  if (ownerAgent) {
    return `${ownerAgent} ${statusLabel.toLowerCase()} ${stepLabel.toLowerCase()}.`;
  }

  return `${stepLabel} is ${statusLabel.toLowerCase()}.`;
}

function humanizeStepLabel(targetType: string | null | undefined) {
  switch ((targetType ?? '').toLowerCase()) {
    case 'source_search':
      return 'Source Search';
    case 'draft_generation':
      return 'Draft Generation';
    case 'content_orchestration':
      return 'Editorial Orchestration';
    case 'image_layout':
      return 'Image & Layout';
    case 'image_generation':
      return 'Image Generation';
    case 'legal_review':
      return 'Legal Review';
    case 'tax_review':
      return 'Tax Review';
    case 'review_queue':
      return 'Review Queue';
    default:
      return (targetType ?? 'Workflow step').replace(/[_-]+/g, ' ');
  }
}

function humanizeStatus(status: string | null | undefined) {
  switch ((status ?? '').toLowerCase()) {
    case 'queued':
      return 'Queued';
    case 'running':
      return 'Running';
    case 'succeeded':
      return 'Succeeded';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    case 'resolved':
      return 'Resolved';
    case 'open':
      return 'Open';
    default:
      return status ? status.replace(/[_-]+/g, ' ') : 'Unknown';
  }
}

function normalizeRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function getText(record: UnknownRecord | null, keys: string[]) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}
