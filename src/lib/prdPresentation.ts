type UnknownRecord = Record<string, unknown>;

export type PrdPresentationModel = {
  title?: string;
  subtitle?: string;
  platform?: string;
  status_label?: string;
  priority_label?: string;
  content_preview?: string;
  body_preview?: string;
  caption?: string;
  hashtags?: string[];
  call_to_action?: string;
  image_preview_url?: string;
  image_status_label?: string;
  layout_summary?: string;
  creative_summary?: string;
  approval_status_label?: string;
  approval_recommendation?: string;
  required_fix?: string;
  degraded_message?: string;
  next_action_label?: string;
  agent_name?: string;
  updated_at_label?: string;
};

export type PrdDebugModel = {
  internal_payload?: UnknownRecord | null;
  raw_metadata?: UnknownRecord | null;
  provider_response?: unknown;
  technical_ids?: Record<string, string | null | undefined>;
};

export type PresentationDraft = {
  languageCode: string;
  languageLabel: string;
  title: string | null;
  body: string | null;
  status?: string | null;
  createdAt?: string | null;
};

export type PresentationAsset = {
  id?: string | null;
  assetType: string;
  layoutType?: string | null;
  url?: string | null;
  storagePath?: string | null;
  altText?: string | null;
  source?: string | null;
  sortOrder?: number | null;
  metadata?: UnknownRecord | null;
};

const APP_TIMEZONE = 'Asia/Bangkok';

export function normalizeTextValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function normalizeRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function normalizeStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const values = value
    .map((entry) => normalizeTextValue(entry))
    .filter((entry): entry is string => Boolean(entry));

  return values.length > 0 ? values : undefined;
}

function normalizeFirstString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeTextValue(entry)).find(Boolean);
  }

  return normalizeTextValue(value);
}

function getTextFromRecord(record: UnknownRecord | null, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = normalizeTextValue(record?.[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function getValueFromRecord(record: UnknownRecord | null, keys: string[]): unknown {
  for (const key of keys) {
    if (record && Object.prototype.hasOwnProperty.call(record, key)) {
      const value = record[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  return undefined;
}

export function mapGeneratedDrafts(value: unknown): PresentationDraft[] {
  let rawValue = value;

  if (typeof rawValue === 'string') {
    try {
      rawValue = JSON.parse(rawValue);
    } catch {
      return [];
    }
  }

  if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    const nested = (rawValue as UnknownRecord).generatedDrafts;
    if (Array.isArray(nested)) {
      rawValue = nested;
    }
  }

  if (!Array.isArray(rawValue)) {
    return [];
  }

  return rawValue
    .map((entry): PresentationDraft | null => {
      const record = normalizeRecord(entry);
      if (!record) {
        return null;
      }

      const languageCode =
        normalizeTextValue(record.languageCode) ||
        normalizeTextValue(record.language_code) ||
        normalizeTextValue(record.language) ||
        normalizeTextValue(record.lang);
      const body =
        normalizeTextValue(record.body) ||
        normalizeTextValue(record.text) ||
        normalizeTextValue(record.content);

      if (!languageCode || !body) {
        return null;
      }

      return {
        languageCode,
        languageLabel: normalizeTextValue(record.languageLabel) || languageCode.toUpperCase(),
        title: normalizeTextValue(record.title) || normalizeTextValue(record.topic) || `${languageCode.toUpperCase()} draft`,
        body,
        status: normalizeTextValue(record.status) || undefined,
        createdAt: normalizeTextValue(record.createdAt) || normalizeTextValue(record.created_at) || undefined,
      };
    })
    .filter((entry): entry is PresentationDraft => Boolean(entry));
}

export function mapGeneratedAssets(value: unknown): PresentationAsset[] {
  let rawValue = value;

  if (typeof rawValue === 'string') {
    try {
      rawValue = JSON.parse(rawValue);
    } catch {
      return [];
    }
  }

  if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    const nested = (rawValue as UnknownRecord).generatedAssets;
    if (Array.isArray(nested)) {
      rawValue = nested;
    }
  }

  if (!Array.isArray(rawValue)) {
    return [];
  }

  return rawValue
    .map((entry): PresentationAsset | null => {
      const record = normalizeRecord(entry);
      if (!record) {
        return null;
      }

      return {
        id: normalizeTextValue(record.id) || undefined,
        assetType:
          normalizeTextValue(record.assetType) ||
          normalizeTextValue(record.asset_type) ||
          normalizeTextValue(record.type) ||
          'image',
        layoutType: normalizeTextValue(record.layoutType) || normalizeTextValue(record.layout_type) || undefined,
        url: normalizeTextValue(record.url) || normalizeTextValue(record.imageUrl) || normalizeTextValue(record.image_url) || undefined,
        storagePath: normalizeTextValue(record.storagePath) || normalizeTextValue(record.storage_path) || undefined,
        altText: normalizeTextValue(record.altText) || normalizeTextValue(record.alt_text) || undefined,
        source: normalizeTextValue(record.source) || undefined,
        sortOrder: typeof record.sortOrder === 'number' ? record.sortOrder : typeof record.sort_order === 'number' ? record.sort_order : undefined,
        metadata: normalizeRecord(record.metadata),
      };
    })
    .filter((entry): entry is PresentationAsset => Boolean(entry))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function isPlaceholderAsset(asset: PresentationAsset) {
  return asset.metadata?.generatedAssetPlaceholder === true;
}

function isDurableAsset(asset: PresentationAsset) {
  return Boolean(asset.storagePath?.length || asset.metadata?.durableAssetReference === true);
}

function isTransientAsset(asset: PresentationAsset) {
  return !isPlaceholderAsset(asset) && !isDurableAsset(asset) && Boolean(asset.url || asset.metadata?.transientAssetReference);
}

function isFailedAsset(asset: PresentationAsset) {
  return Boolean(
    normalizeTextValue(asset.metadata?.failureReason) ||
      normalizeTextValue(asset.metadata?.errorMessage) ||
      normalizeTextValue(asset.metadata?.error_message),
  );
}

function getRealAssets(assets: PresentationAsset[]) {
  return assets.filter((asset) => !isPlaceholderAsset(asset) && isDurableAsset(asset) && Boolean(asset.url || asset.storagePath));
}

function buildImageStatusLabel(assets: PresentationAsset[], degradedMessage: string | undefined) {
  const realAssets = getRealAssets(assets);
  const failedAssets = assets.filter((asset) => isFailedAsset(asset));
  const pendingAssets = assets.filter((asset) => isPlaceholderAsset(asset) || (!asset.url && !asset.storagePath));
  const transientAssets = assets.filter((asset) => isTransientAsset(asset));

  if (degradedMessage || failedAssets.length > 0) {
    return 'Generation failed';
  }

  if (realAssets.length > 0) {
    return 'Output ready';
  }

  if (transientAssets.length > 0) {
    return 'Pending durable storage';
  }

  if (pendingAssets.length > 0) {
    return 'Pending generation';
  }

  return 'Pending';
}

function truncateText(value: string | undefined, length = 180) {
  if (!value) {
    return undefined;
  }

  return value.length > length ? `${value.slice(0, length - 1).trimEnd()}…` : value;
}

function formatUpdatedLabel(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIMEZONE,
  });
}

function buildLayoutSummary(metadata: UnknownRecord | null) {
  const plan = normalizeStringList(metadata?.assetLayoutPlan);
  const layout = normalizeTextValue(metadata?.layout);
  const visualStructure = getTextFromRecord(metadata, ['visual_structure', 'visualStructure']);

  if (plan && plan.length > 0) {
    return truncateText(plan.join(' • '), 160);
  }

  return truncateText(layout || visualStructure, 160);
}

function buildCreativeSummary(metadata: UnknownRecord | null) {
  return truncateText(
    getTextFromRecord(metadata, ['creativeSummary', 'creative_summary']) ||
      getTextFromRecord(metadata, ['visualBrief', 'visual_brief']) ||
      getTextFromRecord(metadata, ['readable_layout_summary', 'layout_preview_summary']),
    200,
  );
}

function buildApprovalStatusLabel(reviewStatus: string | null | undefined, readinessStatus: string | undefined) {
  if (readinessStatus) {
    return readinessStatus.replace(/[_-]+/g, ' ');
  }

  switch ((reviewStatus ?? '').toLowerCase()) {
    case 'approved':
      return 'Approved';
    case 'in_review':
      return 'In review';
    case 'rejected':
      return 'Rejected';
    case 'request_changes':
      return 'Changes requested';
    default:
      return reviewStatus ? reviewStatus.replace(/[_-]+/g, ' ') : 'Pending review';
  }
}

function buildNextActionLabel(reviewStatus: string | null | undefined, hasRealAsset: boolean, degradedMessage: string | undefined) {
  if (degradedMessage) {
    return 'Resolve degraded output';
  }

  switch ((reviewStatus ?? '').toLowerCase()) {
    case 'approved':
      return 'Queue for publishing';
    case 'in_review':
      return 'Complete review';
    case 'ready_for_review':
      return 'Open review queue';
    case 'assets_ready':
      return hasRealAsset ? 'Build review package' : 'Wait for image output';
    case 'text_ready':
      return 'Run image and layout';
    case 'source_search':
      return 'Generate text';
    default:
      return 'Continue workflow';
  }
}

export function buildPrdPresentation(params: {
  title?: string | null;
  subtitle?: string | null;
  platform?: string | null;
  status?: string | null;
  priority?: string | null;
  metadata?: UnknownRecord | null;
  generatedDrafts?: unknown;
  generatedAssets?: unknown;
  updatedAt?: string | null;
  dueAt?: string | null;
  agentName?: string | null;
}) {
  const metadata = normalizeRecord(params.metadata);
  const userFacingOutput = normalizeRecord(metadata?.user_facing_output);
  const internalPayload = normalizeRecord(metadata?.internal_payload);
  const drafts = mapGeneratedDrafts(params.generatedDrafts ?? metadata?.generatedDrafts);
  const assets = mapGeneratedAssets(params.generatedAssets ?? getValueFromRecord(metadata, ['generatedAssets', 'contentAssets', 'assets']));
  const firstDraft = drafts[0];
  const firstVisibleAsset = assets.find((asset) => !isPlaceholderAsset(asset) && Boolean(asset.url || asset.storagePath));
  const firstRealAsset = getRealAssets(assets)[0];
  const degradedMessage =
    getTextFromRecord(metadata, ['degradedMessage', 'degraded_message']) ||
    getTextFromRecord(userFacingOutput, ['degraded_message_if_failed', 'degraded_message']);
  const readinessStatus =
    getTextFromRecord(metadata, ['readinessStatus', 'readiness_status']) ||
    getTextFromRecord(userFacingOutput, ['readiness_status']);
  const approvalRecommendation =
    getTextFromRecord(metadata, ['approvalRecommendation', 'approval_recommendation']) ||
    getTextFromRecord(userFacingOutput, ['approval_recommendation']) ||
    getTextFromRecord(metadata, ['approvalSummary', 'approval_summary']);
  const requiredFix =
    getTextFromRecord(metadata, ['requiredFix', 'required_fix']) ||
    getTextFromRecord(userFacingOutput, ['required_fix']);
  const hashtags =
    normalizeStringList(getValueFromRecord(userFacingOutput, ['hashtags'])) ||
    normalizeStringList(getValueFromRecord(metadata, ['hashtags']));
  const callToAction =
    getTextFromRecord(userFacingOutput, ['call_to_action']) ||
    getTextFromRecord(metadata, ['callToAction', 'call_to_action', 'cta']);
  const caption =
    getTextFromRecord(userFacingOutput, ['caption']) ||
    truncateText(firstDraft?.body || undefined, 220);
  const body =
    getTextFromRecord(userFacingOutput, ['body']) ||
    firstDraft?.body ||
    getTextFromRecord(metadata, ['contentPreview', 'content_preview']);
  const imageStatusLabel =
    getTextFromRecord(userFacingOutput, ['image_status']) ||
    getTextFromRecord(metadata, ['assetComposerStatus', 'imageStatusLabel']) ||
    buildImageStatusLabel(assets, degradedMessage);
  const layoutSummary = buildLayoutSummary(metadata);
  const creativeSummary =
    getTextFromRecord(userFacingOutput, ['creative_summary']) ||
    buildCreativeSummary(metadata);
  const title =
    getTextFromRecord(userFacingOutput, ['title']) ||
    normalizeTextValue(params.title) ||
    firstDraft?.title ||
    'Untitled content item';
  const subtitle =
    normalizeTextValue(params.subtitle) ||
    getTextFromRecord(userFacingOutput, ['platform_notes']) ||
    getTextFromRecord(metadata, ['platformNotes', 'platform_notes']) ||
    getTextFromRecord(metadata, ['visualBrief', 'visual_brief']) ||
    undefined;

  const presentation: PrdPresentationModel = {
    title,
    subtitle,
    platform: normalizeTextValue(params.platform) || normalizeFirstString(getValueFromRecord(metadata, ['platforms'])) || undefined,
    status_label: params.status ? params.status.replace(/[_-]+/g, ' ') : undefined,
    priority_label: normalizeTextValue(params.priority),
    content_preview:
      getTextFromRecord(userFacingOutput, ['approval_summary']) ||
      truncateText(caption || body || firstDraft?.body || undefined, 160),
    body_preview: truncateText(body, 260),
    caption,
    hashtags,
    call_to_action: callToAction,
    image_preview_url: firstRealAsset?.url || firstVisibleAsset?.url || undefined,
    image_status_label: imageStatusLabel,
    layout_summary: layoutSummary,
    creative_summary: creativeSummary,
    approval_status_label: buildApprovalStatusLabel(params.status, readinessStatus),
    approval_recommendation: approvalRecommendation,
    required_fix: requiredFix,
    degraded_message: degradedMessage,
    next_action_label: buildNextActionLabel(params.status, Boolean(firstRealAsset), degradedMessage),
    agent_name: normalizeTextValue(params.agentName) || getTextFromRecord(metadata, ['agentName', 'agent_name']),
    updated_at_label: formatUpdatedLabel(params.updatedAt || params.dueAt),
  };

  const debug: PrdDebugModel = {
    internal_payload: internalPayload,
    raw_metadata: metadata,
    provider_response: getValueFromRecord(internalPayload, ['providerResponse', 'provider_response']),
  };

  return {
    presentation,
    debug,
    drafts,
    assets,
  };
}

export function buildLogPresentation(params: {
  eventType: string;
  source?: string | null;
  severity?: string | null;
  status?: string | null;
  message?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: UnknownRecord | null;
  createdAt?: string | null;
}) {
  const metadata = normalizeRecord(params.metadata);
  const readableMessage =
    getTextFromRecord(metadata, ['readableMessage', 'readable_message']) ||
    getTextFromRecord(metadata, ['userFacingSummary', 'user_facing_summary']) ||
    normalizeTextValue(params.message) ||
    params.eventType.replace(/^workflow\./, '').replace(/[._-]+/g, ' ');
  const agentName = getTextFromRecord(metadata, ['agentName', 'agent_name']);
  const relatedId =
    getTextFromRecord(metadata, ['contentItemId', 'content_item_id']) ||
    getTextFromRecord(metadata, ['reviewItemId', 'review_item_id']) ||
    getTextFromRecord(metadata, ['workflowId', 'workflow_id']) ||
    params.targetId ||
    undefined;

  return {
    agent_name: agentName || params.source || params.targetType || 'System',
    event_type: params.eventType,
    status: normalizeTextValue(params.status) || 'logged',
    readable_message: readableMessage.charAt(0).toUpperCase() + readableMessage.slice(1),
    user_facing_summary:
      getTextFromRecord(metadata, ['userFacingSummary', 'user_facing_summary']) || truncateText(readableMessage, 180),
    related_id: relatedId,
    degraded_message:
      getTextFromRecord(metadata, ['degradedMessage', 'degraded_message']) ||
      (normalizeTextValue(params.status)?.toLowerCase() === 'failed' ? normalizeTextValue(params.message) : undefined),
    timestamp: formatUpdatedLabel(params.createdAt),
    severity_label: normalizeTextValue(params.severity)?.toUpperCase() || 'INFO',
  };
}
