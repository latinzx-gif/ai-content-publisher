import type { SupabaseClient } from '@supabase/supabase-js';
import {
  assertOpenAIAgentConfig,
  isOpenAIAgentModel,
  normalizeOpenAIAgentProvider,
} from '@/lib/agents/openaiModels';
import { resetDownstreamWorkflowMetadata } from '@/lib/agents/contentWorkflowMetadata';
import { runOpenAIResponse } from '@/lib/agents/openaiResponses';
import { runOpenAIImage } from '@/lib/agents/openaiImages';
import { resolveExecutionModel } from '@/lib/agents/modelPolicy';
import { discoverAgentRuntimes, type AgentRuntimePreference, type AgentRuntimeProvider } from '@/lib/agents/runtimeDiscovery';
import { buildAgentRagContext, type AgentRagContext } from '@/lib/rag/buildRagContext';
import { queueAgentRun } from '@/lib/server/agentQueue';
import { writeAuditEvent } from '@/lib/server/audit';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';

type AgentRun = {
  id: string;
  agent_id: string | null;
  trigger_source: string;
  target_type: string | null;
  target_id: string | null;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
};

type QueueNextResult = {
  taskType: string;
  status: 'already_pending' | 'queued';
  runId: string | null;
  agent?: string;
  model?: string;
};

type Agent = {
  id: string;
  name: string;
  provider: string;
  model: string;
  system_prompt: string | null;
  status: string;
};

type ContentItem = {
  id: string;
  title: string;
  brief: string | null;
  category: string | null;
  service_area: string | null;
  status: string;
  risk_level: 'low' | 'medium' | 'high';
  created_by: string | null;
  assigned_to: string | null;
  metadata: Record<string, unknown>;
};

type WorkflowContext = {
  contentItem: ContentItem;
  translations: unknown[];
  assets: unknown[];
  reviews: unknown[];
  rag?: AgentRagContext | null;
};

type AgentStructuredOutput = {
  summary?: string;
  status?: string;
  confidence?: string | number;
  nextRecommendedTask?: string | null;
  artifacts?: Record<string, unknown>;
  riskNotes?: string[];
  citations?: string[];
  images?: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  user_facing_output?: Record<string, unknown>;
  internal_payload?: Record<string, unknown>;
};

type ExecuteAgentRunInput = {
  supabase: SupabaseClient;
  runId?: string;
  actorProfileId: string;
  providerPreference?: AgentRuntimePreference;
};

type ExecutionAttempt = {
  provider: AgentRuntimeProvider;
  outcome: 'attempted' | 'failed' | 'succeeded';
  reason?: string;
};

type ExecutionTransportResult = {
  provider: AgentRuntimeProvider;
  response: {
    responseId: string | null;
    text: string;
    usage: Record<string, unknown>;
    raw: unknown;
  };
  attempts: ExecutionAttempt[];
  fallbackReason: string | null;
};

type SelectedRouting = {
  provider?: unknown;
  model?: unknown;
  riskLevel?: unknown;
  requiredCapability?: unknown;
  selectedBy?: unknown;
};

export async function executeAgentRun({
  supabase,
  runId,
  actorProfileId,
  providerPreference = 'codex',
}: ExecuteAgentRunInput) {
  const run = runId ? await claimRun(supabase, runId) : await claimNextRun(supabase);

  const claimedRunId = normalizeOptionalUuid(run?.id);
  const claimedAgentId = normalizeOptionalUuid(run?.agent_id);

  if (!run || !claimedRunId) {
    return {
      status: runId ? 'already_claimed' : 'idle',
      run: null,
      message: runId ? 'Agent run is no longer queued.' : 'No queued agent runs.',
    };
  }

  if (!claimedAgentId) {
    const message = 'Agent run does not have an agent_id';
    const { data: failedRun } = await supabase
      .from('agent_runs')
      .update({
        status: 'failed',
        output: { error: message },
        completed_at: new Date().toISOString(),
      })
      .eq('id', claimedRunId)
      .select('id, status, output, completed_at')
      .maybeSingle();

    await bestEffort(writeAgentLog(supabase, claimedRunId, 'error', message, { targetType: run.target_type }));

    return {
      status: 'failed',
      run: failedRun ?? { ...run, id: claimedRunId, status: 'failed', output: { error: message } },
      message,
    };
  }

  await bestEffort(writeAgentLog(supabase, claimedRunId, 'info', 'Agent run started', { targetType: run.target_type }));

  try {
    const agent = await getAgent(supabase, claimedAgentId);
    const selectedRouting = getSelectedRouting(run.input);
    const requestedProvider = selectedRouting?.provider ?? agent.provider;
    const requestedModel = selectedRouting?.model;
    const provider = normalizeProviderSafely(requestedProvider, agent.provider);
    const fallbackModel = agent.model ?? 'gpt-5.4';
    const requestedModelCandidate = typeof requestedModel === 'string' ? requestedModel : '';
    const model = isOpenAIAgentModel(requestedModelCandidate)
      ? requestedModelCandidate
      : fallbackModel;
    assertOpenAIAgentConfig(provider, model);

    const executionModelResolution = resolveExecutionModel(model);
    const executionModel = executionModelResolution.model;
    const workflowContext = await getWorkflowContext(supabase, run);
    const execution = await executeWithPreference({
      providerPreference,
      model: executionModel,
      instructions: buildAgentInstructions(agent.system_prompt, run.target_type),
      input: {
        taskType: run.target_type,
        targetId: run.target_id,
        input: run.input,
        workflowContext,
      },
      responseFormat: 'json',
    });
    const response = execution.response;
    const structuredOutput = normalizeAgentStructuredOutput(run.target_type, parseAgentJson(response.text), response.text);

    const output = {
      provider: execution.provider,
      model: executionModel,
      requestedModel: model,
      providerPreference,
      providerAttempts: execution.attempts,
      providerFallbackReason: execution.fallbackReason,
      responseId: response.responseId,
      text: response.text,
      user_facing_output: structuredOutput.user_facing_output ?? null,
      internal_payload: {
        providerRaw: response.raw,
        providerResponseText: response.text,
        structuredOutput,
      },
      modelFallbackApplied: executionModelResolution.fallbackApplied,
      modelFallbackReason: executionModelResolution.fallbackReason,
      structured: structuredOutput,
      routing: selectedRouting,
    };

    const { data: updatedRun, error: updateError } = await supabase
      .from('agent_runs')
      .update({
        status: 'succeeded',
        output,
        token_usage: response.usage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', run.id)
      .select('id, status, output, token_usage, completed_at')
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    const handoff = await applyAgentHandoff({
      supabase,
      run,
      actorProfileId,
      output: structuredOutput,
      rawText: response.text,
      workflowContext,
    });

    await Promise.allSettled([
      writeAgentLog(supabase, run.id, 'info', 'Agent run succeeded', {
        provider: execution.provider,
        providerPreference,
        model: executionModel,
        responseId: response.responseId,
        handoff,
      }),
      writeAuditEvent(supabase, {
        actorProfileId,
        eventType: 'agent.run_succeeded',
        targetType: 'agent_run',
        targetId: run.id,
        metadata: {
          provider: execution.provider,
          providerPreference,
          model: executionModel,
          requestedModel: model,
          responseId: response.responseId,
          handoff,
          providerFallbackReason: execution.fallbackReason,
        },
      }),
      writeSystemLogBestEffort(supabase, {
        actorProfileId,
        eventType: 'workflow.agent_run_succeeded',
        source: 'agent_executor',
        status: 'succeeded',
        targetType: 'agent_run',
        targetId: run.id,
        message: `${agent.name} completed ${run.target_type ?? 'agent task'} via ${execution.provider}.`,
        metadata: {
          contentItemId: run.target_id,
          provider: execution.provider,
          providerPreference,
          model: executionModel,
          requestedModel: model,
          modelFallbackApplied: executionModelResolution.fallbackApplied,
          modelFallbackReason: executionModelResolution.fallbackReason,
          providerFallbackReason: execution.fallbackReason,
          handoff,
        },
      }),
    ]);

    if (executionModelResolution.fallbackApplied) {
      await writeSystemLogBestEffort(supabase, {
        actorProfileId,
        eventType: 'workflow.agent_runtime_model_fallback',
        source: 'agent_executor',
        status: 'succeeded',
        severity: 'low',
        targetType: 'agent_run',
        targetId: run.id,
        message: `Execution model fallback applied from ${executionModelResolution.requestedModel} to ${executionModel}.`,
        metadata: {
          requestedModel: executionModelResolution.requestedModel,
          fallbackModel: executionModel,
          fallbackReason: executionModelResolution.fallbackReason,
          taskType: run.target_type,
        },
      });
    }

    return {
      status: 'succeeded',
      run: updatedRun,
      message: 'Agent run completed.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Agent execution failed';

    const { data: failedRun, error: failedUpdateError } = await supabase
      .from('agent_runs')
      .update({
        status: 'failed',
        output: { error: message },
        completed_at: new Date().toISOString(),
      })
      .eq('id', run.id)
      .select('id, status, output, completed_at')
      .maybeSingle();

    if (failedUpdateError) {
      await bestEffort(
        supabase.from('error_events').insert({
          type: 'agent_failure_recording_failed',
          severity: 'critical',
          status: 'open',
          message: failedUpdateError.message,
          source: 'agent_executor',
          agent_run_id: run.id,
          metadata: { originalError: message, runId: run.id, targetType: run.target_type },
        }),
      );

      return {
        status: 'failed_to_record_failure',
        run,
        message,
        recordingError: failedUpdateError.message,
      };
    }

    await Promise.allSettled([
      writeAgentLog(supabase, run.id, 'error', message, {}),
      writeSystemLogBestEffort(supabase, {
        actorProfileId,
        eventType: 'workflow.agent_run_failed',
        source: 'agent_executor',
        severity: 'high',
        status: 'failed',
        targetType: 'agent_run',
        targetId: run.id,
        message,
        metadata: { contentItemId: run.target_id, targetType: run.target_type },
      }),
      supabase.from('error_events').insert({
        type: 'agent_run_failed',
        severity: 'high',
        status: 'open',
        message,
        source: 'agent_executor',
        agent_run_id: run.id,
        metadata: { runId: run.id, targetType: run.target_type },
      }),
      writeAuditEvent(supabase, {
        actorProfileId,
        eventType: 'agent.run_failed',
        targetType: 'agent_run',
        targetId: run.id,
        metadata: { message },
      }),
    ]);

    return {
      status: 'failed',
      run: failedRun ?? { ...run, status: 'failed', output: { error: message } },
      message,
    };
  }
}

async function getWorkflowContext(supabase: SupabaseClient, run: AgentRun) {
  const targetId = normalizeOptionalUuid(run.target_id);

  if (!targetId) {
    return null;
  }

  const { data: contentItem } = await supabase
    .from('content_items')
    .select('id,title,brief,category,service_area,status,risk_level,created_by,assigned_to,metadata')
    .eq('id', targetId)
    .maybeSingle<ContentItem>();

  if (!contentItem) {
    return null;
  }

  const [translationsResult, assetsResult, reviewResult] = await Promise.all([
    supabase
      .from('content_translations')
      .select('language,title,body,hashtags,status')
      .eq('content_item_id', contentItem.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('content_assets')
      .select('asset_type,layout_type,url,storage_path,alt_text,source,sort_order,metadata')
      .eq('content_item_id', contentItem.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('review_items')
      .select('id,review_type,status,risk_level')
      .eq('content_item_id', contentItem.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const rag =
    run.target_type === 'source_search'
      ? await bestEffortValue(
          buildAgentRagContext({
            query: buildSourceSearchQuery(contentItem, run.input),
            category: contentItem.category ?? contentItem.service_area,
            strictCitation: getSourcePolicy(contentItem, run.input) === 'knowledge_base_required',
            limit: 8,
          }),
          null,
        )
      : null;

  return {
    contentItem,
    translations: translationsResult.data ?? [],
    assets: assetsResult.data ?? [],
    reviews: reviewResult.data ?? [],
    rag,
  };
}

async function executeWithPreference({
  providerPreference,
  model,
  instructions,
  input,
  responseFormat,
}: {
  providerPreference: AgentRuntimePreference;
  model: string;
  instructions: string | null;
  input: Record<string, unknown>;
  responseFormat: 'json' | 'text';
}): Promise<ExecutionTransportResult> {
  const runtimeSelection = discoverAgentRuntimes(providerPreference);
  const selectedPreference = runtimeSelection.selectedProvider;

  if (!selectedPreference) {
    throw new Error('No agent runtime is available. Configure CODEX_LOCAL_BRIDGE_URL/CODEX_LOCAL_BRIDGE_SECRET or OPENAI_API_KEY.');
  }

  if (selectedPreference === 'openai') {
    if (model === 'gpt-image-2') {
      const response = await runOpenAIImage({
        model,
        prompt: String(input.prompt || input.visualBrief || input.imageBrief || input.title || 'Legal professional office background'),
      });

      return {
        provider: 'openai',
        response: {
          responseId: `img_${Date.now()}`,
          text: JSON.stringify({ images: response.images }),
          usage: {},
          raw: response,
        },
        attempts: [{ provider: 'openai', outcome: 'succeeded' }],
        fallbackReason: null,
      };
    }

    const response = await runOpenAIResponse({
      model,
      instructions,
      input,
      responseFormat,
    });

    return {
      provider: 'openai',
      response,
      attempts: [{ provider: 'openai', outcome: 'succeeded' }],
      fallbackReason: null,
    };
  }

  const attempts: ExecutionAttempt[] = [];

  if (selectedPreference === 'multica') {
    try {
      const response = await runMulticaResponse({
        model,
        instructions,
        input,
        responseFormat,
      });

      attempts.push({ provider: 'multica', outcome: 'succeeded' });

      return {
        provider: 'multica',
        response,
        attempts,
        fallbackReason: null,
      };
    } catch (error) {
      attempts.push({ provider: 'multica', outcome: 'failed', reason: error instanceof Error ? error.message : 'Multica execution failed' });
    }
  }

  try {
    const response = await runCodexResponse({
      model,
      instructions,
      input,
      responseFormat,
    });

    attempts.push({ provider: 'codex', outcome: 'succeeded' });

    return {
      provider: 'codex',
      response,
      attempts,
      fallbackReason: null,
    };
  } catch (error) {
    const codexError = error instanceof Error ? error.message : 'Codex execution failed';

    attempts.push({ provider: 'codex', outcome: 'failed', reason: codexError });

    try {
      const response = await runOpenAIResponse({
        model,
        instructions,
        input,
        responseFormat,
      });

      attempts.push({ provider: 'openai', outcome: 'succeeded' });

      return {
        provider: 'openai',
        response,
        attempts,
        fallbackReason: `Codex execution unavailable: ${codexError}`,
      };
    } catch (openAiError) {
      const openAiMessage = openAiError instanceof Error ? openAiError.message : 'OpenAI execution failed';

      attempts.push({ provider: 'openai', outcome: 'failed', reason: openAiMessage });

      throw new Error(`Codex attempt failed (${codexError}); OpenAI fallback failed (${openAiMessage}).`);
    }
  }
}

async function runMulticaResponse({
  model,
  instructions,
  input,
  responseFormat,
}: {
  model: string;
  instructions: string | null;
  input: Record<string, unknown>;
  responseFormat: 'json' | 'text';
}): Promise<{ responseId: string | null; text: string; usage: Record<string, unknown>; raw: unknown }> {
  const bridgeUrl = process.env.MULTICA_AGENT_BRIDGE_URL?.trim();
  const bridgeSecret = process.env.MULTICA_AGENT_BRIDGE_SECRET?.trim();

  if (!bridgeUrl) {
    throw new Error('Missing MULTICA_AGENT_BRIDGE_URL. Configure this value to use Multica execution.');
  }

  if (!bridgeSecret) {
    throw new Error('Missing MULTICA_AGENT_BRIDGE_SECRET. Configure bridge secret before using Multica execution.');
  }

  if (!/^https?:\/\//i.test(bridgeUrl)) {
    throw new Error('MULTICA_AGENT_BRIDGE_URL must be an HTTP endpoint when used from the server.');
  }

  const response = await fetch(bridgeUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bridgeSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'multica',
      model,
      instructions,
      input,
      responseFormat,
    }),
  });

  const payload = (await response.json().catch(async () => ({
    raw: await response.text(),
  }))) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(extractCodexError(payload).replace('Codex', 'Multica'));
  }

  const text = extractCodexText(payload);

  if (!text) {
    throw new Error('Multica response did not contain output text.');
  }

  return {
    responseId:
      typeof payload.response_id === 'string'
        ? payload.response_id
        : typeof payload.responseId === 'string'
          ? payload.responseId
          : null,
    text,
    usage:
      payload.usage && typeof payload.usage === 'object' && !Array.isArray(payload.usage)
        ? (payload.usage as Record<string, unknown>)
        : {},
    raw: payload,
  };
}

async function runCodexResponse({
  model,
  instructions,
  input,
  responseFormat,
}: {
  model: string;
  instructions: string | null;
  input: Record<string, unknown>;
  responseFormat: 'json' | 'text';
}): Promise<{ responseId: string | null; text: string; usage: Record<string, unknown>; raw: unknown }> {
  const bridgeUrl = process.env.CODEX_LOCAL_BRIDGE_URL?.trim();
  const bridgeSecret = process.env.CODEX_LOCAL_BRIDGE_SECRET?.trim();

  if (!bridgeUrl) {
    throw new Error('Missing CODEX_LOCAL_BRIDGE_URL. Configure this value to use Codex execution.');
  }

  if (!bridgeSecret) {
    throw new Error('Missing CODEX_LOCAL_BRIDGE_SECRET. Configure bridge secret before using Codex execution.');
  }

  if (!/^https?:\/\//i.test(bridgeUrl)) {
    throw new Error('CODEX_LOCAL_BRIDGE_URL must be an HTTP endpoint when used from the server.');
  }

  const response = await fetch(bridgeUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bridgeSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'codex',
      model,
      instructions,
      input,
      responseFormat,
    }),
  });

  const payload = (await response.json().catch(async () => ({
    raw: await response.text(),
  }))) as Record<string, unknown>;

  if (!response.ok) {
    const codexError = extractCodexError(payload);
    throw new Error(codexError);
  }

  const text = extractCodexText(payload);

  if (!text) {
    throw new Error('Codex response did not contain output text.');
  }

  return {
    responseId:
      typeof payload.response_id === 'string'
        ? payload.response_id
        : typeof payload.responseId === 'string'
          ? payload.responseId
          : null,
    text,
    usage:
      payload.usage && typeof payload.usage === 'object' && !Array.isArray(payload.usage)
        ? (payload.usage as Record<string, unknown>)
        : {},
    raw: payload,
  };
}

function extractCodexError(payload: Record<string, unknown>) {
  if (typeof payload.error === 'string') {
    return payload.error;
  }

  if (payload.error && typeof payload.error === 'object' && !Array.isArray(payload.error)) {
    const codexError = payload.error as { message?: unknown };

    if (typeof codexError.message === 'string') {
      return codexError.message;
    }
  }

  if (typeof payload.message === 'string') {
    return payload.message;
  }

  return 'Codex bridge request failed';
}

function extractCodexText(payload: Record<string, unknown>) {
  if (typeof payload.text === 'string') {
    return payload.text.trim();
  }

  if (typeof payload.output_text === 'string') {
    return payload.output_text.trim();
  }

  if (typeof payload.output === 'string') {
    return payload.output.trim();
  }

  if (Array.isArray(payload.output) && payload.output.length > 0) {
    const chunks = payload.output
      .filter((item) => item && typeof item === 'object')
      .flatMap((item) => {
        const outputItem = item as { content?: unknown };

        if (!Array.isArray(outputItem.content)) {
          return [] as string[];
        }

        return outputItem.content
          .filter((chunk) => chunk && typeof chunk === 'object')
          .map((chunk) => {
            const outputChunk = chunk as { type?: string; text?: unknown };

            return outputChunk.type === 'output_text' && typeof outputChunk.text === 'string' ? outputChunk.text : '';
          });
      });

    return chunks.join('\n').trim();
  }

  return '';
}

async function bestEffortValue<T>(promise: Promise<T>, fallback: T) {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function buildSourceSearchQuery(contentItem: ContentItem, input: Record<string, unknown>) {
  const brief = typeof input.brief === 'string' ? input.brief : contentItem.brief ?? '';
  const title = typeof input.title === 'string' ? input.title : contentItem.title;
  const category = contentItem.category ?? contentItem.service_area ?? '';

  return [title, brief, category].filter(Boolean).join('\n');
}

function getSourcePolicy(contentItem: ContentItem, input: Record<string, unknown>) {
  const inputPolicy = typeof input.sourcePolicy === 'string' ? input.sourcePolicy : null;
  const metadataPolicy = typeof contentItem.metadata?.sourcePolicy === 'string' ? contentItem.metadata.sourcePolicy : null;

  return inputPolicy ?? metadataPolicy ?? 'knowledge_base_required';
}

function parseAgentJson(text: string): AgentStructuredOutput {
  const trimmed = text.trim();

  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed) as AgentStructuredOutput;
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        summary: trimmed,
        status: 'completed',
        confidence: 'unknown',
        artifacts: {},
        riskNotes: [],
        citations: [],
      };
    }

    try {
      return JSON.parse(jsonMatch[0]) as AgentStructuredOutput;
    } catch {
      return {
        summary: trimmed,
        status: 'completed',
        confidence: 'unknown',
        artifacts: {},
        riskNotes: [],
        citations: [],
      };
    }
  }
}

function buildAgentInstructions(systemPrompt: string | null | undefined, taskType: string | null) {
  const taskContract = buildTaskContractInstructions(taskType);

  return [systemPrompt, taskContract].filter(Boolean).join('\n\n');
}

function buildTaskContractInstructions(taskType: string | null) {
  const normalizedTask = (taskType ?? '').toLowerCase();
  const baseContract = [
    'Separate all output into two top-level objects:',
    '1. user_facing_output',
    '2. internal_payload',
    'user_facing_output must be safe for normal operators, human-readable, and ready for /prd rendering.',
    'internal_payload may contain machine-oriented details, intermediate structures, or debug metadata, but must not be written for normal users.',
    'Keep artifacts populated for workflow handoff compatibility.',
  ].join('\n');

  if (normalizedTask.includes('draft') || normalizedTask.includes('content_orchestration')) {
    return [
      baseContract,
      'For content text tasks, user_facing_output must include: title, caption, body, hashtags, call_to_action, platform_notes, approval_summary.',
      'When multiple languages are produced, also include localized_posts as an array of objects with language, title, caption, body, hashtags, call_to_action, platform_notes, approval_summary.',
    ].join('\n');
  }

  if (normalizedTask.includes('image_generation')) {
    return [
      baseContract,
      'For image generation tasks, user_facing_output must include: image_preview_url or another visible asset reference, image_status, image_alt_text, creative_summary, degraded_message_if_failed.',
      'Do not mark image generation complete without a real visible asset reference.',
    ].join('\n');
  }

  if (normalizedTask.includes('image_layout')) {
    return [
      baseContract,
      'For layout/creative tasks, user_facing_output must include: layout_preview_url OR readable layout summary, visual_structure, headline_position, image_focus, color_style, creative_notes.',
      'Layout placeholders are planning artifacts, not final creative output.',
    ].join('\n');
  }

  if (normalizedTask.includes('review') || normalizedTask.includes('compliance') || normalizedTask.includes('legal') || normalizedTask.includes('tax')) {
    return [
      baseContract,
      'For approval/compliance tasks, user_facing_output must include: readiness_status, approval_recommendation, issues_found, required_fix, final_decision_label.',
    ].join('\n');
  }

  return baseContract;
}

function normalizeAgentStructuredOutput(taskType: string | null, parsed: AgentStructuredOutput, rawText: string): AgentStructuredOutput {
  const existingUserFacing = normalizeRecord(parsed.user_facing_output) ?? {};
  const derivedUserFacing = deriveUserFacingOutput(taskType, parsed, rawText);
  const existingInternalPayload = normalizeRecord(parsed.internal_payload) ?? {};

  return {
    ...parsed,
    user_facing_output: {
      ...derivedUserFacing,
      ...existingUserFacing,
    },
    internal_payload: existingInternalPayload,
  };
}

function deriveUserFacingOutput(taskType: string | null, parsed: AgentStructuredOutput, rawText: string) {
  const normalizedTask = (taskType ?? '').toLowerCase();
  const artifacts = normalizeRecord(parsed.artifacts) ?? {};

  if (normalizedTask.includes('draft') || normalizedTask.includes('content_orchestration')) {
    const body = getStringArtifact(artifacts, 'body') ?? getStringArtifact(artifacts, 'draft') ?? parsed.summary ?? rawText.trim();
    const caption = getStringArtifact(artifacts, 'caption') ?? body;
    const callToAction = getStringArtifact(artifacts, 'callToAction') ?? getStringArtifact(artifacts, 'cta');
    const approvalSummary = getStringArtifact(artifacts, 'approvalSummary') ?? parsed.summary ?? 'Draft generated and ready for human review.';
    const platformNotes = normalizeStringList((artifacts.platformNotes as string[] | undefined) ?? []);
    const hashtags = normalizeStringList((artifacts.hashtags as string[] | undefined) ?? []);
    const localizedPosts = deriveLocalizedPostsFromArtifacts(artifacts, {
      caption,
      body,
      hashtags,
      callToAction: callToAction ?? undefined,
      approvalSummary,
      platformNotes,
    });

    return {
      title: getStringArtifact(artifacts, 'title') ?? getStringArtifact(artifacts, 'topic') ?? 'Generated post draft',
      caption,
      body,
      hashtags,
      call_to_action: callToAction,
      platform_notes: platformNotes,
      approval_summary: approvalSummary,
      localized_posts: localizedPosts,
    };
  }

  if (normalizedTask.includes('image_generation')) {
    const images = parsed.images ?? [];
    const firstImage = images[0];
    const previewUrl =
      typeof firstImage?.url === 'string' && firstImage.url.length > 0
        ? firstImage.url
        : typeof firstImage?.b64_json === 'string' && firstImage.b64_json.length > 0
          ? `data:image/png;base64,${firstImage.b64_json}`
          : undefined;

    return {
      image_preview_url: previewUrl,
      image_status: previewUrl ? 'ready' : 'failed',
      image_alt_text: getStringArtifact(artifacts, 'imageAltText') ?? getStringArtifact(artifacts, 'altText') ?? 'Generated legal/accounting visual',
      creative_summary: getStringArtifact(artifacts, 'creativeSummary') ?? parsed.summary ?? 'Image generation result',
      degraded_message_if_failed: previewUrl ? undefined : parsed.summary ?? 'Image generation did not return a visible asset reference.',
    };
  }

  if (normalizedTask.includes('image_layout')) {
    const layoutSummary = getStringArtifact(artifacts, 'layoutSummary') ?? getStringArtifact(artifacts, 'visualBrief') ?? getStringArtifact(artifacts, 'imageBrief') ?? parsed.summary ?? rawText.slice(0, 600);

    return {
      layout_preview_url: getStringArtifact(artifacts, 'layoutPreviewUrl'),
      readable_layout_summary: layoutSummary,
      visual_structure: normalizeStringList((artifacts.visualStructure as string[] | undefined) ?? normalizeStringList((artifacts.assetLayoutPlan as string[] | undefined) ?? [])),
      headline_position: getStringArtifact(artifacts, 'headlinePosition'),
      image_focus: getStringArtifact(artifacts, 'imageFocus') ?? layoutSummary,
      color_style: getStringArtifact(artifacts, 'colorStyle'),
      creative_notes: getStringArtifact(artifacts, 'creativeNotes') ?? parsed.summary ?? layoutSummary,
    };
  }

  if (normalizedTask.includes('review') || normalizedTask.includes('compliance') || normalizedTask.includes('legal') || normalizedTask.includes('tax')) {
    const issuesFound = normalizeStringList(parsed.riskNotes);
    const passed = (parsed.status ?? '').toLowerCase() === 'passed' || (parsed.status ?? '').toLowerCase() === 'completed';

    return {
      readiness_status: passed ? 'ready_for_review' : 'needs_attention',
      approval_recommendation: parsed.summary ?? 'Human reviewer should verify the package before publishing.',
      issues_found: issuesFound,
      required_fix: issuesFound[0] ?? 'Verify citations and claims during human review.',
      final_decision_label: passed ? 'Review ready' : 'Needs reviewer attention',
    };
  }

  return {
    summary: parsed.summary ?? rawText.trim(),
  };
}

function deriveLocalizedPostsFromArtifacts(
  artifacts: Record<string, unknown>,
  fallback: {
    caption: string;
    body: string;
    hashtags: string[];
    callToAction?: string;
    approvalSummary: string;
    platformNotes: string[];
  },
) {
  const translations = artifacts.translations;

  if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return undefined;
  }

  return Object.entries(translations)
    .map(([language, value]) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
      }

      const translation = value as Record<string, unknown>;
      const body =
        (typeof translation.body === 'string' && translation.body.trim()) ||
        (typeof translation.draft === 'string' && translation.draft.trim()) ||
        fallback.body;

    return {
        language,
        title:
          (typeof translation.title === 'string' && translation.title.trim()) ||
          `${String(language).toUpperCase()} draft`,
        caption:
          (typeof translation.caption === 'string' && translation.caption.trim()) ||
          body,
        body,
        hashtags: Array.isArray(translation.hashtags)
          ? translation.hashtags.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          : fallback.hashtags,
        call_to_action:
          (typeof translation.call_to_action === 'string' && translation.call_to_action.trim()) ||
          (typeof translation.callToAction === 'string' && translation.callToAction.trim()) ||
          fallback.callToAction,
        platform_notes: Array.isArray(translation.platform_notes)
          ? translation.platform_notes.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          : fallback.platformNotes,
        approval_summary:
          (typeof translation.approval_summary === 'string' && translation.approval_summary.trim()) ||
          fallback.approvalSummary,
      };
    })
    .filter((item) => item !== null);
}

async function applyAgentHandoff({
  supabase,
  run,
  actorProfileId,
  output,
  rawText,
  workflowContext,
}: {
  supabase: SupabaseClient;
  run: AgentRun;
  actorProfileId: string;
  output: AgentStructuredOutput;
  rawText: string;
  workflowContext: Awaited<ReturnType<typeof getWorkflowContext>>;
}) {
  if (!run.target_id || !workflowContext?.contentItem) {
    return { applied: false, reason: 'missing_content_target' };
  }

  switch (run.target_type) {
    case 'source_search':
      return applySourceSearchHandoff({ supabase, run, actorProfileId, output, rawText, workflowContext });
    case 'content_orchestration':
      return applyContentOrchestrationHandoff({ supabase, run, actorProfileId, output, rawText, contentItem: workflowContext.contentItem });
    case 'draft_generation':
      return applyDraftGenerationHandoff({ supabase, run, actorProfileId, output, rawText, contentItem: workflowContext.contentItem });
    case 'image_layout':
      return applyImageLayoutHandoff({ supabase, run, actorProfileId, output, rawText, contentItem: workflowContext.contentItem });
    case 'image_generation':
      return applyImageGenerationHandoff({ supabase, run, actorProfileId, output, rawText, contentItem: workflowContext.contentItem });
    case 'legal_review':
    case 'tax_review':
      return applyComplianceHandoff({ supabase, run, actorProfileId, output, rawText, contentItem: workflowContext.contentItem });
    default:
      return { applied: false, reason: 'no_handoff_for_task_type', taskType: run.target_type };
  }
}

async function applySourceSearchHandoff({
  supabase,
  run,
  actorProfileId,
  output,
  rawText,
  workflowContext,
}: {
  supabase: SupabaseClient;
  run: AgentRun;
  actorProfileId: string;
  output: AgentStructuredOutput;
  rawText: string;
  workflowContext: WorkflowContext;
}) {
  const outputCitations = normalizeStringList(output.citations);
  const ragCitations = workflowContext.rag?.citations.map((citation) => `${citation.title} (${Math.round(citation.score * 100)}%)`) ?? [];
  const citations = outputCitations.length ? outputCitations : ragCitations;
  const sourcePolicy = typeof run.input.sourcePolicy === 'string' ? run.input.sourcePolicy : workflowContext.contentItem.metadata?.sourcePolicy;
  const requiresSource = sourcePolicy === 'knowledge_base_required';
  const blocked = requiresSource && citations.length === 0;
  const { error } = await supabase
    .from('content_items')
    .update({
      status: blocked ? 'source_search' : 'generating',
      metadata: {
        ...workflowContext.contentItem.metadata,
        sourceSearch: {
          summary: output.summary ?? rawText.slice(0, 600),
          citations,
          blocked,
          guardrailReason: workflowContext.rag?.reason ?? null,
          completedAt: new Date().toISOString(),
        },
      },
    })
    .eq('id', run.target_id);

  if (error) {
    throw new Error(error.message);
  }

  await writeSystemLogBestEffort(supabase, {
    eventType: blocked ? 'workflow.source_search_blocked' : 'workflow.source_search_completed',
    source: 'agent_executor',
    status: blocked ? 'open' : 'succeeded',
    severity: blocked ? 'medium' : 'low',
    targetType: 'content_item',
    targetId: run.target_id,
    message: blocked
      ? 'Source Search Agent found no approved citations and kept content in source search.'
      : 'Source Search Agent completed citations and moved content into generation.',
    metadata: { agentRunId: run.id, citations, ragBlocked: workflowContext.rag?.blocked ?? null },
  });

  const queued = blocked
    ? null
    : await queueNextIfMissing({
        supabase,
        taskType: 'draft_generation',
        targetId: workflowContext.contentItem.id,
        riskLevel: workflowContext.contentItem.risk_level,
        triggerSource: 'agent_handoff',
        input: {
          contentJobId: workflowContext.contentItem.id,
          fromAgentRunId: run.id,
          title: workflowContext.contentItem.title,
          brief: workflowContext.contentItem.brief ?? '',
          category: workflowContext.contentItem.category ?? workflowContext.contentItem.service_area ?? null,
          languages: run.input.languages ?? workflowContext.contentItem.metadata?.languages,
          platforms: run.input.platforms ?? workflowContext.contentItem.metadata?.platforms,
          sourcePolicy,
          citations,
        },
      });

  if (queued) {
    await logOrchestratorAssignment({
      supabase,
      actorProfileId,
      contentItemId: workflowContext.contentItem.id,
      phase: 'create_post_pipeline_entry',
      position: '1',
      sourceTask: 'source_search',
      destinationTask: 'draft_generation',
      triggerRunId: run.id,
      queueResult: queued,
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId,
      eventType: 'workflow.draft_generation_queued',
      source: 'agent_executor',
      status: 'queued',
      targetType: 'content_item',
      targetId: workflowContext.contentItem.id,
      message: 'Source Search passed and queued Draft Generation Agent.',
      metadata: { agentRunId: run.id, queued },
    });
  }

  return { applied: true, nextStatus: blocked ? 'source_search' : 'generating', blocked, citations: citations.length, queued };
}

async function applyContentOrchestrationHandoff({
  supabase,
  run,
  actorProfileId,
  output,
  rawText,
  contentItem,
}: {
  supabase: SupabaseClient;
  run: AgentRun;
  actorProfileId: string;
  output: AgentStructuredOutput;
  rawText: string;
  contentItem: ContentItem;
}) {
  const artifacts = output.artifacts ?? {};
  const sections = Array.isArray(artifacts.sections) ? artifacts.sections : [];
  const completedAt = new Date().toISOString();

  const nextMetadata = {
    ...contentItem.metadata,
    contentOrchestration: {
      summary: output.summary ?? rawText.slice(0, 600),
      sections,
      completedAt,
      agentRunId: run.id,
    },
  };

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

  // Queue the first generation task with orchestration context
  const queued = await queueNextIfMissing({
    supabase,
    taskType: 'draft_generation',
    targetId: contentItem.id,
    riskLevel: contentItem.risk_level,
    triggerSource: 'agent_handoff',
    input: {
      contentJobId: contentItem.id,
      fromAgentRunId: run.id,
      orchestration: {
        mode: 'long_form',
        currentSectionIndex: 0,
        totalSections: sections.length,
        sections,
      },
    },
  });

  if (queued) {
    await logOrchestratorAssignment({
      supabase,
      actorProfileId,
      contentItemId: contentItem.id,
      phase: 'editorial_orchestration',
      position: '2',
      sourceTask: 'content_orchestration',
      destinationTask: 'draft_generation',
      triggerRunId: run.id,
      queueResult: queued,
    });
  }

  return { applied: true, nextStatus: 'generating', sections: sections.length, queued };
}

async function applyDraftGenerationHandoff({
  supabase,
  run,
  actorProfileId,
  output,
  rawText,
  contentItem,
}: {
  supabase: SupabaseClient;
  run: AgentRun;
  actorProfileId: string;
  output: AgentStructuredOutput;
  rawText: string;
  contentItem: ContentItem;
}) {
  const orchestration = normalizeRecord(run.input.orchestration);
  const isOrchestrated = orchestration?.mode === 'long_form';
  const currentSectionIndex = typeof orchestration?.currentSectionIndex === 'number' ? orchestration.currentSectionIndex : -1;
  const sections = Array.isArray(orchestration?.sections) ? orchestration.sections : [];
  const hasMoreSections = isOrchestrated && currentSectionIndex < sections.length - 1;

  const languages = normalizeLanguages(run.input.languages ?? contentItem.metadata?.languages);
  const artifacts = output.artifacts ?? {};
  const userFacingOutput = normalizeRecord(output.user_facing_output) ?? {};
  const localizedUserFacingPosts = Array.isArray(userFacingOutput.localized_posts)
    ? (userFacingOutput.localized_posts as Array<Record<string, unknown>>)
    : [];
  const draftBody =
    (typeof userFacingOutput.body === 'string' && userFacingOutput.body.trim()) ||
    (typeof userFacingOutput.caption === 'string' && userFacingOutput.caption.trim()) ||
    getStringArtifact(artifacts, 'draft') ||
    getStringArtifact(artifacts, 'body') ||
    output.summary ||
    rawText;
  const hashtags = normalizeStringList(artifacts.hashtags).slice(0, 12);
  const completedAt = new Date().toISOString();

  let hashtagsString = '';
  if (!hasMoreSections && hashtags.length > 0) {
    hashtagsString = '\n\n' + hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
  }

  for (const language of languages) {
    const localizedUserFacingPost =
      localizedUserFacingPosts.find(
        (entry) =>
          typeof entry.language === 'string' &&
          entry.language.trim().toLowerCase() === language.trim().toLowerCase(),
      ) ?? null;
    const localizedBody =
      (localizedUserFacingPost && typeof localizedUserFacingPost.body === 'string' && localizedUserFacingPost.body.trim()) ||
      getLocalizedDraft(artifacts, language) ||
      draftBody;
    let finalBody = localizedBody;

    if (isOrchestrated && currentSectionIndex > 0) {
      const { data: existing } = await supabase
        .from('content_translations')
        .select('body')
        .eq('content_item_id', contentItem.id)
        .eq('language', language)
        .maybeSingle();

      if (existing?.body) {
        finalBody = `${existing.body}\n\n${localizedBody}`;
      }
    }

    if (hashtagsString && !finalBody.includes('#')) {
      finalBody += hashtagsString;
    }

    const { error } = await supabase.from('content_translations').upsert(
      {
        content_item_id: contentItem.id,
        language,
        title: contentItem.title,
        body: finalBody,
        hashtags,
        status: 'generated',
      },
      { onConflict: 'content_item_id,language' },
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  if (hasMoreSections) {
    const nextIndex = currentSectionIndex + 1;
    const queued = await queueNextIfMissing({
      supabase,
      taskType: 'draft_generation',
      targetId: contentItem.id,
      riskLevel: contentItem.risk_level,
      triggerSource: 'agent_handoff',
      input: {
        ...run.input,
        orchestration: {
          ...orchestration,
          currentSectionIndex: nextIndex,
        },
      },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId,
      eventType: 'workflow.orchestrator_next_section',
      source: 'agent_executor',
      status: 'queued',
      targetType: 'content_item',
      targetId: contentItem.id,
      message: `Editorial Orchestrator queued section ${nextIndex + 1} of ${sections.length}.`,
      metadata: { agentRunId: run.id, currentSectionIndex, nextIndex, totalSections: sections.length },
    });

    return { applied: true, nextStatus: 'generating', currentSection: currentSectionIndex, nextSection: nextIndex, queued };
  }

  const nextMetadata = resetDownstreamWorkflowMetadata(contentItem.metadata, {
    draftGeneration: {
      summary: output.summary ?? rawText.slice(0, 600),
      languages,
      completedAt,
      agentRunId: run.id,
      orchestration: isOrchestrated ? orchestration : undefined,
    },
    platformNotes: Array.isArray(userFacingOutput.platform_notes)
      ? userFacingOutput.platform_notes.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : undefined,
    approvalSummary:
      typeof userFacingOutput.approval_summary === 'string' ? userFacingOutput.approval_summary : output.summary ?? rawText.slice(0, 600),
    callToAction:
      typeof userFacingOutput.call_to_action === 'string' ? userFacingOutput.call_to_action : undefined,
  });

  const { error: updateError } = await supabase
    .from('content_items')
    .update({
      status: 'text_ready',
      metadata: nextMetadata,
    })
    .eq('id', contentItem.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const queued = await Promise.all([
    queueNextIfMissing({
      supabase,
      taskType: 'image_layout',
      targetId: contentItem.id,
      riskLevel: 'low',
      triggerSource: 'agent_handoff',
      input: {
        contentJobId: contentItem.id,
        fromAgentRunId: run.id,
        languages,
        platforms: run.input.platforms ?? contentItem.metadata?.platforms,
        layout: run.input.layout ?? contentItem.metadata?.layout,
        imageCount: run.input.imageCount ?? contentItem.metadata?.imageCount,
        selectedAssets: run.input.selectedAssets ?? contentItem.metadata?.selectedAssets,
        assetLayoutPlan: run.input.assetLayoutPlan ?? contentItem.metadata?.assetLayoutPlan,
        facebookLayoutRule: run.input.facebookLayoutRule ?? contentItem.metadata?.facebookLayoutRule,
      },
    }),
    queueNextIfMissing({
      supabase,
      taskType: 'legal_review',
      targetId: contentItem.id,
      riskLevel: contentItem.risk_level,
      triggerSource: 'agent_handoff',
      input: {
        contentJobId: contentItem.id,
        fromAgentRunId: run.id,
        languages,
        platforms: run.input.platforms ?? contentItem.metadata?.platforms,
        sourcePolicy: run.input.sourcePolicy ?? contentItem.metadata?.sourcePolicy,
      },
    }),
  ]);

  await Promise.allSettled([
    logOrchestratorAssignment({
      supabase,
      actorProfileId,
      contentItemId: contentItem.id,
      phase: 'draft_generation',
      position: '2.1',
      sourceTask: 'draft_generation',
      destinationTask: 'image_layout',
      triggerRunId: run.id,
      queueResult: queued[0],
    }),
    logOrchestratorAssignment({
      supabase,
      actorProfileId,
      contentItemId: contentItem.id,
      phase: 'draft_generation',
      position: '2.2',
      sourceTask: 'draft_generation',
      destinationTask: 'legal_review',
      triggerRunId: run.id,
      queueResult: queued[1],
    }),
  ]);

  await writeSystemLogBestEffort(supabase, {
    actorProfileId,
    eventType: 'workflow.draft_generation_completed',
    source: 'agent_executor',
    status: 'succeeded',
    targetType: 'content_item',
    targetId: contentItem.id,
    message: isOrchestrated 
      ? `Editorial Orchestrator completed all ${sections.length} sections and queued image/compliance handoff.`
      : 'Draft Generation Agent created translations and queued image/compliance handoff.',
    metadata: { agentRunId: run.id, languages, queued, isOrchestrated },
  });

  return { applied: true, nextStatus: 'text_ready', translations: languages.length, queued };
}

async function applyImageLayoutHandoff({
  supabase,
  run,
  actorProfileId,
  output,
  rawText,
  contentItem,
}: {
  supabase: SupabaseClient;
  run: AgentRun;
  actorProfileId: string;
  output: AgentStructuredOutput;
  rawText: string;
  contentItem: ContentItem;
}) {
  const artifacts = output.artifacts ?? {};
  const userFacingOutput = normalizeRecord(output.user_facing_output) ?? {};
  const completedAt = new Date().toISOString();
  const layoutType = normalizeLayoutType(run.input.layout ?? contentItem.metadata?.layout);
  const requestedImageCount = normalizePositiveInt(run.input.imageCount ?? contentItem.metadata?.imageCount, layoutType === 'carousel' ? 4 : 1);
  const imageCount = enforceLayoutImageCount(layoutType, requestedImageCount, run.input.facebookLayoutRule ?? contentItem.metadata?.facebookLayoutRule);
  const visualBrief =
    (typeof userFacingOutput.readable_layout_summary === 'string' && userFacingOutput.readable_layout_summary.trim()) ||
    getStringArtifact(artifacts, 'visualBrief') ||
    getStringArtifact(artifacts, 'imageBrief') ||
    output.summary ||
    rawText.slice(0, 800);
  const assetLayoutPlan =
    Array.isArray(userFacingOutput.visual_structure)
      ? userFacingOutput.visual_structure.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : normalizeStringList(run.input.assetLayoutPlan ?? contentItem.metadata?.assetLayoutPlan);
  const facebookLayoutRule = normalizeRecord(run.input.facebookLayoutRule ?? contentItem.metadata?.facebookLayoutRule);
  const rows = Array.from({ length: imageCount }, (_, index) => ({
    content_item_id: contentItem.id,
    asset_type: layoutType === 'carousel' ? 'carousel_slide' : 'image',
    layout_type: layoutType,
    alt_text: `${contentItem.title} visual ${index + 1}`,
    source: 'Image & Layout Agent',
    sort_order: index,
    metadata: {
      visualBrief,
      generatedAssetPlaceholder: true,
      agentRunId: run.id,
      slide: index + 1,
      requestedImageCount,
      enforcedImageCount: imageCount,
      assetLayoutPlan,
      facebookLayoutRule,
    },
  }));

  const { error: deleteExistingAssetsError } = await supabase.from('content_assets').delete().eq('content_item_id', contentItem.id);

  if (deleteExistingAssetsError) {
    throw new Error(deleteExistingAssetsError.message);
  }

  const { error: assetError } = await supabase.from('content_assets').insert(rows);

  if (assetError) {
    throw new Error(assetError.message);
  }

  // Queue background image generation for gpt-image-2 if not already done
  await queueAgentRun({
    supabase,
    taskType: 'image_generation',
    riskLevel: 'low',
    targetId: contentItem.id,
    triggerSource: 'image_layout_handoff',
    input: {
      contentJobId: contentItem.id,
      visualBrief,
      imageCount,
      layout: layoutType,
    },
  }).catch(() => null);

  const provisionalMetadata: Record<string, unknown> = {
    ...contentItem.metadata,
    assetComposerStatus: 'Generating assets',
    visualBrief,
    layout: layoutType,
    imageCount,
    requestedImageCount,
    assetLayoutPlan,
    facebookLayoutRule,
    creativeSummary:
      typeof userFacingOutput.creative_notes === 'string'
        ? userFacingOutput.creative_notes
        : typeof userFacingOutput.image_focus === 'string'
          ? userFacingOutput.image_focus
          : visualBrief,
    imageLayout: {
      completedAt,
      agentRunId: run.id,
      status: 'generating',
      generationQueuedAt: completedAt,
      placeholderAssetCount: rows.length,
      generatedCount: 0,
    },
  };

  const reviewQueue = await ensureReviewQueueReady({
    supabase,
    actorProfileId: contentItem.assigned_to ?? contentItem.created_by ?? null,
    contentItem,
    metadata: provisionalMetadata,
    fallbackReviewType: 'legal',
    });

  const nextMetadata = reviewQueue.ready
    ? {
        ...provisionalMetadata,
        compliance: {
          ...(normalizeRecord(provisionalMetadata.compliance) ?? {}),
          reviewId: reviewQueue.reviewId,
          reviewQueuedAt: completedAt,
        },
      }
    : provisionalMetadata;

  const nextStatus = resolveDraftLifecycleStatus(nextMetadata);
  const { error: updateError } = await supabase
    .from('content_items')
    .update({
      status: nextStatus,
      metadata: nextMetadata,
    })
    .eq('id', contentItem.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await writeSystemLogBestEffort(supabase, {
    eventType: reviewQueue.ready ? 'workflow.review_package_ready' : 'workflow.image_layout_completed',
    source: 'agent_executor',
    status: 'succeeded',
    targetType: reviewQueue.ready ? 'review_item' : 'content_item',
    targetId: reviewQueue.ready ? reviewQueue.reviewId : contentItem.id,
    message: reviewQueue.ready
      ? 'Image & Layout Agent completed the final package and moved the workflow into Review Queue.'
      : 'Image & Layout Agent created the visual brief, staged placeholder slots, and queued real image generation.',
    metadata: {
      agentRunId: run.id,
      contentItemId: contentItem.id,
      layoutType,
      imageCount,
      requestedImageCount,
      assetLayoutPlan,
      facebookLayoutRule,
      reviewQueue,
    },
  });

  return { applied: true, nextStatus, layoutType, assets: rows.length, reviewQueue };
}

async function applyImageGenerationHandoff({
  supabase,
  run,
  actorProfileId,
  output,
  rawText,
  contentItem,
}: {
  supabase: SupabaseClient;
  run: AgentRun;
  actorProfileId: string;
  output: AgentStructuredOutput;
  rawText: string;
  contentItem: ContentItem;
}) {
  const { data: existingReviewItem } = await supabase
    .from('review_items')
    .select('id,metadata,status')
    .eq('content_item_id', contentItem.id)
    .eq('status', 'in_review')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const images = (output as any).images || [];
  const userFacingOutput = normalizeRecord(output.user_facing_output) ?? {};
  if (!Array.isArray(images) || images.length === 0) {
    const failedAt = new Date().toISOString();
    const failedMetadata: Record<string, unknown> = {
      ...contentItem.metadata,
      assetComposerStatus: 'Image generation failed',
      degradedMessage:
        typeof userFacingOutput.degraded_message_if_failed === 'string'
          ? userFacingOutput.degraded_message_if_failed
          : 'Image generation did not return a visible asset reference.',
      imageLayout: {
        ...(normalizeRecord(contentItem.metadata?.imageLayout) ?? {}),
        status: 'failed',
        failedAt,
        failureReason: 'no_images_in_output',
        agentRunId: run.id,
      },
    };

    await supabase
      .from('content_items')
      .update({
        status: resolveDraftLifecycleStatus(failedMetadata),
        metadata: failedMetadata,
      })
      .eq('id', contentItem.id);

    if (existingReviewItem?.id) {
      await supabase
        .from('review_items')
        .update({
          metadata: {
            ...(normalizeRecord(existingReviewItem.metadata) ?? {}),
            assetComposerStatus: 'Image generation failed',
            generatedAssetsErrorAt: failedAt,
            generatedAssetsErrorReason: 'no_images_in_output',
          },
        })
        .eq('id', existingReviewItem.id);
    }

    await writeSystemLogBestEffort(supabase, {
      actorProfileId,
      eventType: 'workflow.image_generation_failed',
      source: 'agent_executor',
      status: 'failed',
      severity: 'medium',
      targetType: 'content_item',
      targetId: contentItem.id,
      message: 'Image generation did not return any real image output.',
      metadata: { agentRunId: run.id, contentItemId: contentItem.id, rawText: rawText.slice(0, 400) },
    });

    return { applied: false, reason: 'no_images_in_output' };
  }

  const { data: existingAssets, error: existingAssetsError } = await supabase
    .from('content_assets')
    .select('sort_order,metadata')
    .eq('content_item_id', contentItem.id)
    .order('sort_order', { ascending: true });

  if (existingAssetsError) {
    throw new Error(existingAssetsError.message);
  }

  let generatedCount = 0;
  const expectedCount = existingAssets?.length ?? images.length;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const imageUrl =
      typeof image?.url === 'string' && image.url.length > 0
        ? image.url
        : typeof image?.b64_json === 'string' && image.b64_json.length > 0
          ? `data:image/png;base64,${image.b64_json}`
          : null;

    if (!imageUrl) {
      continue;
    }

    generatedCount += 1;
    const assetMetadata = normalizeRecord(existingAssets?.[i]?.metadata) ?? {};

    const { error: assetUpdateError } = await supabase
      .from('content_assets')
      .update({
        url: imageUrl,
        source: 'OpenAI gpt-image-2',
        metadata: {
          ...assetMetadata,
          generatedAssetPlaceholder: false,
          generatedAt: new Date().toISOString(),
          imageProvider: 'OpenAI',
          imageModel: 'gpt-image-2',
          revisedPrompt: typeof image?.revised_prompt === 'string' ? image.revised_prompt : undefined,
          agentRunId: run.id,
        },
      })
      .eq('content_item_id', contentItem.id)
      .eq('sort_order', i);

    if (assetUpdateError) {
      throw new Error(assetUpdateError.message);
    }
  }

  const generatedAt = new Date().toISOString();
  const imageGenerationStatus = generatedCount >= expectedCount ? 'generated' : 'partial';
  const contentMetadata: Record<string, unknown> = {
    ...contentItem.metadata,
    assetComposerStatus:
      imageGenerationStatus === 'generated'
        ? 'Assets generated'
        : `Assets partially generated (${generatedCount}/${expectedCount})`,
    creativeSummary:
      typeof userFacingOutput.creative_summary === 'string'
        ? userFacingOutput.creative_summary
        : typeof contentItem.metadata?.creativeSummary === 'string'
          ? contentItem.metadata.creativeSummary
          : undefined,
    degradedMessage:
      imageGenerationStatus === 'generated'
        ? undefined
        : typeof userFacingOutput.degraded_message_if_failed === 'string'
          ? userFacingOutput.degraded_message_if_failed
          : undefined,
    imageLayout: {
      ...(normalizeRecord(contentItem.metadata?.imageLayout) ?? {}),
      status: imageGenerationStatus,
      generatedAt,
      completedAt: generatedAt,
      generatedCount,
      expectedCount,
      agentRunId: run.id,
    },
  };

  const reviewQueue =
    imageGenerationStatus === 'generated'
      ? await ensureReviewQueueReady({
          supabase,
          actorProfileId: contentItem.assigned_to ?? contentItem.created_by ?? null,
          contentItem,
          metadata: contentMetadata,
          fallbackReviewType: 'legal',
        })
      : { ready: false as const, reviewId: null, checkId: getComplianceCheckId(contentMetadata), createdReview: false };

  const nextMetadata = reviewQueue.ready
    ? {
        ...contentMetadata,
        compliance: {
          ...(normalizeRecord(contentMetadata.compliance) ?? {}),
          reviewId: reviewQueue.reviewId,
          reviewQueuedAt: generatedAt,
        },
      }
    : contentMetadata;

  const nextStatus = reviewQueue.ready ? 'in_review' : resolveDraftLifecycleStatus(nextMetadata);
  const { error: contentUpdateError } = await supabase
    .from('content_items')
    .update({
      status: nextStatus,
      metadata: nextMetadata,
    })
    .eq('id', contentItem.id);

  if (contentUpdateError) {
    throw new Error(contentUpdateError.message);
  }

  if (existingReviewItem?.id) {
    const reviewMetadataUpdate = {
      ...(normalizeRecord(existingReviewItem.metadata) ?? {}),
      assetComposerStatus:
        imageGenerationStatus === 'generated'
          ? 'Assets generated'
          : `Assets partially generated (${generatedCount}/${expectedCount})`,
      generatedAssetsReadyAt: imageGenerationStatus === 'generated' ? generatedAt : undefined,
      generatedAssetsPartialAt: imageGenerationStatus === 'partial' ? generatedAt : undefined,
    };

    await supabase
      .from('review_items')
      .update({ metadata: reviewMetadataUpdate })
      .eq('id', existingReviewItem.id);
  }

  if (reviewQueue.ready && reviewQueue.createdReview) {
    await logOrchestratorAssignment({
      supabase,
      actorProfileId,
      contentItemId: contentItem.id,
      phase: 'finalization',
      position: '3.1',
      sourceTask: 'image_generation',
      destinationTask: 'review_queue',
      triggerRunId: run.id,
      queueResult: {
        taskType: 'review_queue',
        status: 'queued',
        runId: reviewQueue.reviewId ?? null,
      },
      reviewItemId: reviewQueue.reviewId,
    });
  }

  await writeSystemLogBestEffort(supabase, {
    actorProfileId,
    eventType: reviewQueue.ready ? 'workflow.review_package_ready' : 'workflow.image_generation_completed',
    source: 'agent_executor',
    status: imageGenerationStatus === 'generated' ? 'succeeded' : 'failed',
    severity: imageGenerationStatus === 'generated' ? 'low' : 'medium',
    targetType: reviewQueue.ready ? 'review_item' : 'content_item',
    targetId: reviewQueue.ready ? reviewQueue.reviewId : contentItem.id,
    message:
      imageGenerationStatus === 'generated'
        ? reviewQueue.ready
          ? 'Image Generation Agent persisted real image output and moved the workflow into Review Queue.'
          : 'Image Generation Agent persisted real image output and is waiting for compliance review before review packaging.'
        : `Image Generation Agent persisted ${generatedCount} of ${expectedCount} requested assets.`,
    metadata: {
      agentRunId: run.id,
      contentItemId: contentItem.id,
      generatedCount,
      expectedCount,
      reviewQueue,
    },
  });

  return { applied: true, imagesGenerated: generatedCount, imageGenerationStatus, reviewQueue };
}

async function applyComplianceHandoff({
  supabase,
  run,
  actorProfileId,
  output,
  rawText,
  contentItem,
}: {
  supabase: SupabaseClient;
  run: AgentRun;
  actorProfileId: string;
  output: AgentStructuredOutput;
  rawText: string;
  contentItem: ContentItem;
}) {
  const outputSummary = normalizeTextArtifact(output.summary) ?? rawText.slice(0, 800);
  const userFacingOutput = normalizeRecord(output.user_facing_output) ?? {};
  const explicitRiskNotes = normalizeStringList(output.riskNotes);
  const riskNotes = explicitRiskNotes.length ? explicitRiskNotes : [outputSummary.slice(0, 600)];
  const hasHighRisk = contentItem.risk_level === 'high' || riskNotes.some((note) => note.toLowerCase().includes('high') || note.toLowerCase().includes('missing'));
  const status = hasHighRisk ? 'warning' : 'passed';
  const reviewType = 'legal';
  const completedAt = new Date().toISOString();

  const { data: check, error: checkError } = await supabase
    .from('compliance_checks')
    .insert({
      content_item_id: contentItem.id,
      status,
      summary: outputSummary,
      model: 'openai-agent-run',
    })
    .select('id')
    .single();

  if (checkError) {
    throw new Error(checkError.message);
  }

  if (riskNotes.length) {
    const { error: findingsError } = await supabase.from('compliance_findings').insert(
      riskNotes.slice(0, 6).map((finding) => ({
        compliance_check_id: check.id,
        severity: hasHighRisk ? 'medium' : 'low',
        finding,
        source_reference: normalizeStringList(output.citations)[0] ?? null,
        suggested_fix: hasHighRisk ? 'Human reviewer should verify this claim before approval.' : 'Verify citations during human review.',
      })),
    );

    if (findingsError) {
      throw new Error(findingsError.message);
    }
  }

  const provisionalMetadata: Record<string, unknown> = {
    ...contentItem.metadata,
    readinessStatus:
      typeof userFacingOutput.readiness_status === 'string' ? userFacingOutput.readiness_status : status === 'passed' ? 'ready_for_review' : 'needs_attention',
    approvalRecommendation:
      typeof userFacingOutput.approval_recommendation === 'string' ? userFacingOutput.approval_recommendation : outputSummary,
    issuesFound:
      Array.isArray(userFacingOutput.issues_found)
        ? userFacingOutput.issues_found.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : riskNotes,
    requiredFix:
      typeof userFacingOutput.required_fix === 'string' ? userFacingOutput.required_fix : riskNotes[0] ?? 'Verify citations during human review.',
    finalDecisionLabel:
      typeof userFacingOutput.final_decision_label === 'string' ? userFacingOutput.final_decision_label : status === 'passed' ? 'Review ready' : 'Needs reviewer attention',
    compliance: {
      status,
      reviewType,
      checkId: check.id,
      completedAt,
      agentRunId: run.id,
    },
  };

  const reviewQueue = await ensureReviewQueueReady({
    supabase,
    actorProfileId,
    contentItem,
    metadata: provisionalMetadata,
    fallbackReviewType: reviewType,
  });

  const nextMetadata = reviewQueue.ready
    ? {
        ...provisionalMetadata,
        compliance: {
          ...(normalizeRecord(provisionalMetadata.compliance) ?? {}),
          reviewId: reviewQueue.reviewId,
          reviewQueuedAt: completedAt,
        },
      }
    : provisionalMetadata;

  const nextStatus = reviewQueue.ready ? 'in_review' : resolveDraftLifecycleStatus(nextMetadata);
  const { error: contentUpdateError } = await supabase
    .from('content_items')
    .update({
      status: nextStatus,
      metadata: nextMetadata,
    })
    .eq('id', contentItem.id);

  if (contentUpdateError) {
    throw new Error(contentUpdateError.message);
  }

  if (reviewQueue.ready && reviewQueue.createdReview) {
    await logOrchestratorAssignment({
      supabase,
      actorProfileId,
      contentItemId: contentItem.id,
      phase: 'finalization',
      position: '3.2',
      sourceTask: 'legal_review',
      destinationTask: 'review_queue',
      triggerRunId: run.id,
      queueResult: {
        taskType: 'review_queue',
        status: 'queued',
        runId: reviewQueue.reviewId ?? null,
      },
      reviewItemId: reviewQueue.reviewId,
    });
  }

  await writeSystemLogBestEffort(supabase, {
    actorProfileId,
    eventType: reviewQueue.ready ? 'workflow.review_package_ready' : 'workflow.compliance_review_completed',
    source: 'agent_executor',
    severity: hasHighRisk ? 'medium' : 'low',
    status: 'succeeded',
    targetType: reviewQueue.ready ? 'review_item' : 'content_item',
    targetId: reviewQueue.ready ? reviewQueue.reviewId : contentItem.id,
    message: reviewQueue.ready
      ? 'Compliance Agent completed the final package and moved the workflow into Review Queue.'
      : 'Compliance Agent stored risk findings and is waiting for image/layout handoff before review packaging.',
    metadata: { agentRunId: run.id, contentItemId: contentItem.id, checkId: check.id, status, reviewQueue },
  });

  return {
    applied: true,
    nextStatus,
    complianceStatus: status,
    reviewId: reviewQueue.reviewId,
    checkId: check.id,
    reviewQueue,
  };
}

async function ensureReviewQueueReady({
  supabase,
  actorProfileId,
  contentItem,
  metadata,
  fallbackReviewType,
}: {
  supabase: SupabaseClient;
  actorProfileId: string | null;
  contentItem: ContentItem;
  metadata: Record<string, unknown>;
  fallbackReviewType: 'legal' | 'tax';
}) {
  if (!hasCompletedImageLayout(metadata) || !hasCompletedCompliance(metadata)) {
    return { ready: false as const, reviewId: null, checkId: getComplianceCheckId(metadata), createdReview: false };
  }

  const reviewType = getComplianceReviewType(metadata) ?? fallbackReviewType;
  const { data: existingReview, error: existingReviewError } = await supabase
    .from('review_items')
    .select('id,status')
    .eq('content_item_id', contentItem.id)
    .eq('review_type', reviewType)
    .eq('status', 'in_review')
    .maybeSingle<{ id: string; status: string }>();

  if (existingReviewError) {
    throw new Error(existingReviewError.message);
  }

  let reviewId = existingReview?.id ?? null;
  let createdReview = false;

  if (!reviewId) {
    const { data: review, error: reviewError } = await supabase
      .from('review_items')
      .insert({
        content_item_id: contentItem.id,
        assigned_reviewer: actorProfileId,
        review_type: reviewType,
        status: 'in_review',
        risk_level: contentItem.risk_level,
      })
      .select('id')
      .single();

    if (reviewError) {
      throw new Error(reviewError.message);
    }

    reviewId = review.id;
    createdReview = true;
  }

  const checkId = getComplianceCheckId(metadata);

  if (checkId) {
    const { error: checkUpdateError } = await supabase.from('compliance_checks').update({ review_item_id: reviewId }).eq('id', checkId);

    if (checkUpdateError) {
      throw new Error(checkUpdateError.message);
    }
  }

  return { ready: true as const, reviewId, checkId, createdReview };
}

function resolveDraftLifecycleStatus(metadata: Record<string, unknown>) {
  if (hasCompletedImageLayout(metadata) && hasCompletedCompliance(metadata)) {
    return 'in_review';
  }

  if (hasCompletedImageLayout(metadata)) {
    return 'assets_ready';
  }

  return 'text_ready';
}

function hasCompletedImageLayout(metadata: Record<string, unknown>) {
  const imageLayout = normalizeRecord(metadata.imageLayout);

  if (imageLayout?.status === 'generated') {
    return typeof imageLayout.generatedAt === 'string' || (typeof imageLayout.completedAt === 'string' && imageLayout.completedAt.length > 0);
  }

  return !imageLayout?.status && typeof imageLayout?.completedAt === 'string' && imageLayout.completedAt.length > 0;
}

function hasCompletedCompliance(metadata: Record<string, unknown>) {
  const compliance = normalizeRecord(metadata.compliance);

  return typeof compliance?.completedAt === 'string' && compliance.completedAt.length > 0 && Boolean(getComplianceCheckId(metadata));
}

function getComplianceCheckId(metadata: Record<string, unknown>) {
  const compliance = normalizeRecord(metadata.compliance);

  return typeof compliance?.checkId === 'string' && compliance.checkId.length > 0 ? compliance.checkId : null;
}

function getComplianceReviewType(metadata: Record<string, unknown>) {
  const compliance = normalizeRecord(metadata.compliance);
  const reviewType = typeof compliance?.reviewType === 'string' ? compliance.reviewType : null;

  return reviewType === 'tax' ? 'tax' : reviewType === 'legal' ? 'legal' : null;
}

async function queueNextIfMissing({
  supabase,
  taskType,
  targetId,
  riskLevel,
  triggerSource,
  input,
}: {
  supabase: SupabaseClient;
  taskType: string;
  targetId: string;
  riskLevel: 'low' | 'medium' | 'high';
  triggerSource: string;
  input: Record<string, unknown>;
}): Promise<QueueNextResult> {
  const { data: existing, error } = await supabase
    .from('agent_runs')
    .select('id,status')
    .eq('target_id', targetId)
    .eq('target_type', taskType)
    .in('status', ['queued', 'running'])
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (existing?.length) {
    return { taskType, status: 'already_pending', runId: existing[0].id };
  }

  const queued = await queueAgentRun({
    supabase,
    taskType,
    targetId,
    riskLevel,
    triggerSource,
    input,
  });

  return { taskType, status: 'queued', runId: queued.run.id, agent: queued.agent.name, model: queued.model.name };
}

async function logOrchestratorAssignment({
  supabase,
  actorProfileId,
  contentItemId,
  phase,
  position,
  sourceTask,
  destinationTask,
  triggerRunId,
  queueResult,
  reviewItemId,
}: {
  supabase: SupabaseClient;
  actorProfileId: string;
  contentItemId: string;
  phase: string;
  position: string;
  sourceTask: string;
  destinationTask: string;
  triggerRunId: string;
  queueResult: QueueNextResult;
  reviewItemId?: string | null;
}) {
  const assignedAt = new Date().toISOString();

  await writeSystemLogBestEffort(supabase, {
    actorProfileId,
    eventType: 'workflow.orchestrator_dispatch',
    source: 'agent_orchestrator',
    status: queueResult.status === 'already_pending' ? 'running' : 'queued',
    targetType: 'content_item',
    targetId: contentItemId,
    message: `Agent Orchestrator assigned ${destinationTask} from ${sourceTask} (step ${position}, ${phase}).`,
    metadata: {
      pipelineOwner: 'Agent Orchestrator',
      pipelinePosition: position,
      pipelinePhase: phase,
      sourceTask,
      destinationTask,
      destinationAgent: queueResult.agent ?? null,
      destinationModel: queueResult.model ?? null,
      destinationRunId: queueResult.runId,
      triggerRunId,
      reviewItemId: reviewItemId ?? null,
      assignedAt,
    },
  });
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function normalizeTextArtifact(value: unknown) {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }

  return null;
}

function normalizeLanguages(value: unknown): Array<'th' | 'en' | 'zh' | 'ja'> {
  const raw = normalizeStringList(value);
  const mapped = raw
    .map((language) => {
      const normalized = language.toLowerCase();

      if (normalized === 'th' || normalized.includes('thai') || normalized.includes('ไทย')) {
        return 'th';
      }

      if (normalized === 'en' || normalized.includes('english')) {
        return 'en';
      }

      if (normalized === 'zh' || normalized === 'cn' || normalized.includes('chinese') || normalized.includes('中文')) {
        return 'zh';
      }

      if (normalized === 'ja' || normalized === 'jp' || normalized.includes('japanese') || normalized.includes('日本')) {
        return 'ja';
      }

      return null;
    })
    .filter((language): language is 'th' | 'en' | 'zh' | 'ja' => Boolean(language));

  return mapped.length ? Array.from(new Set(mapped)) : ['th', 'en'];
}

function getStringArtifact(artifacts: Record<string, unknown>, key: string) {
  const value = artifacts[key];

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getLocalizedDraft(artifacts: Record<string, unknown>, language: string) {
  const translations = artifacts.translations;

  if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return null;
  }

  const value = (translations as Record<string, unknown>)[language];

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeLayoutType(value: unknown): 'single' | 'grid' | 'carousel' {
  if (typeof value !== 'string') {
    return 'single';
  }

  const normalized = value.toLowerCase();

  if (normalized.includes('carousel')) {
    return 'carousel';
  }

  if (normalized.includes('grid')) {
    return 'grid';
  }

  return 'single';
}

function normalizePositiveInt(value: unknown, fallback: number) {
  const numberValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(Math.max(Math.round(numberValue), 1), 10);
}

function enforceLayoutImageCount(layoutType: 'single' | 'grid' | 'carousel', requestedImageCount: number, facebookLayoutRule: unknown) {
  const hasFacebookRule = Boolean(facebookLayoutRule);

  if (layoutType === 'single') {
    return 1;
  }

  if (layoutType === 'grid') {
    return hasFacebookRule ? 4 : Math.min(Math.max(requestedImageCount, 1), 4);
  }

  if (layoutType === 'carousel') {
    return hasFacebookRule ? Math.min(Math.max(requestedImageCount, 3), 5) : Math.min(Math.max(requestedImageCount, 1), 10);
  }

  return requestedImageCount;
}

function normalizeRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

async function bestEffort(promise: PromiseLike<unknown>) {
  try {
    await promise;
  } catch {
    // Logging and audit writes should not block the agent executor.
  }
}

function getSelectedRouting(input: Record<string, unknown>) {
  const routing = input.routing;

  if (!routing || typeof routing !== 'object' || Array.isArray(routing)) {
    return null;
  }

  const selectedRouting = routing as SelectedRouting;
  const provider = typeof selectedRouting.provider === 'string' ? selectedRouting.provider : null;
  const model = typeof selectedRouting.model === 'string' ? selectedRouting.model : null;

  if (!provider || !model) {
    return null;
  }

  return {
    provider,
    model,
    riskLevel: selectedRouting.riskLevel,
    requiredCapability: selectedRouting.requiredCapability,
    selectedBy: selectedRouting.selectedBy,
  };
}

async function claimNextRun(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('claim_next_agent_run');

  if (error) {
    throw new Error(error.message);
  }

  return data as AgentRun | null;
}

function normalizeProviderSafely(requestedProvider: unknown, fallbackProvider: string) {
  const providerCandidate = typeof requestedProvider === 'string' && requestedProvider.trim() ? requestedProvider : fallbackProvider;

  try {
    return normalizeOpenAIAgentProvider(providerCandidate);
  } catch {
    return 'openai';
  }
}

async function claimRun(supabase: SupabaseClient, runId: string) {
  const { data, error } = await supabase
    .from('agent_runs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', runId)
    .eq('status', 'queued')
    .select('id, agent_id, trigger_source, target_type, target_id, status, input')
    .maybeSingle<AgentRun>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getAgent(supabase: SupabaseClient, agentId: string) {
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, provider, model, system_prompt, status')
    .eq('id', agentId)
    .maybeSingle<Agent>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Agent not found');
  }

  if (data.status !== 'online') {
    throw new Error(`Agent is not online: ${data.status}`);
  }

  return data;
}

async function writeAgentLog(
  supabase: SupabaseClient,
  agentRunId: string,
  level: 'debug' | 'info' | 'warning' | 'error',
  message: string,
  metadata: Record<string, unknown>,
) {
  const { error } = await supabase.from('agent_logs').insert({
    agent_run_id: agentRunId,
    level,
    message,
    metadata,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function normalizeOptionalUuid(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return null;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized) ? normalized : null;
}
