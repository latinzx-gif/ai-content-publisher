import type { PrdDebugModel, PrdPresentationModel } from '@/lib/prdPresentation';

import type { AgentRuntimePreference } from './runtime';

export type CalendarPostStatus = 'queued' | 'posted' | 'draft' | 'issue';

export type CalendarFocusPost = {
  id: string;
  time: string;
  title: string;
  service: string;
  status: CalendarPostStatus;
  scheduledAt: string | null;
};

export type CalendarDayPost = {
  id: string;
  title: string;
  service: string;
  status: CalendarPostStatus;
  scheduledAt: string | null;
};

export type CalendarDay = { date: string; dateKey?: string; muted: boolean; posts: CalendarDayPost[] };

export type CalendarQueueItem = {
  id: string;
  title: string;
  service_area: string | null;
  status: string | null;
  risk_level: string | null;
  scheduled_at: string | null;
  metadata: Record<string, unknown>;
};

export type CalendarApiResponse = {
  window: { start: string; end: string };
  items: CalendarQueueItem[];
  dailySlots: { date: string; count: number; warning: 'ok' | 'notice' | 'critical' }[];
};

export type CalendarCapacity = { date: string; count: number; warning: 'ok' | 'notice' | 'critical' };

export type CalendarPayload = {
  days: CalendarDay[];
  focusPosts: CalendarFocusPost[];
  focusLabel: string;
  dailySlotsByDate: Record<string, CalendarCapacity>;
};

export type CalendarWeekCoverageItem = {
  service: string;
  day: string;
  dayIndex: number;
  targetCount: number;
  actualCount: number;
  covered: boolean;
};

export type PublishingChannelSummary = {
  name: string;
  status: 'Success' | 'Failed';
  sync: string;
  queue: number;
  health: string;
};

export type PublishingQueueRow = {
  id: string;
  title: string;
  platform: string;
  time: string;
  status: 'Ready' | 'Syncing' | 'Failed' | 'Queued' | 'Published' | 'Cancelled';
};

export type PublishingErrorRow = { time: string; platform: string; message: string };

export type PublishingQueueApiRow = {
  id: string;
  content_item_id: string;
  platform: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  content_items: { id: string; title: string | null; service_area: string | null } | null;
};

export type PublishingErrorApiRow = {
  id: string;
  error_code: string | null;
  message: string | null;
  created_at: string;
  publishing_job_id: string | null;
};

export type PublishingJobApiRow = {
  id: string;
  publishing_queue_id: string;
  status: string;
  external_post_id: string | null;
  attempt_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type PublishingIntegrationApiRow = {
  id: string;
  account_name: string | null;
  external_account_id: string | null;
  status: string;
  scopes: string[];
  last_sync_at: string | null;
  metadata: Record<string, unknown> | null;
  integrations: { provider: string; display_name: string } | { provider: string; display_name: string }[] | null;
};

export type PublishingApiResponse = {
  queue: PublishingQueueApiRow[];
  errors: PublishingErrorApiRow[];
  jobs?: PublishingJobApiRow[];
  integrations?: PublishingIntegrationApiRow[];
  summary: Record<string, number>;
};

export type ReviewApiRow = {
  id: string;
  content_item_id: string;
  review_type: string;
  status: string;
  risk_level: string | null;
  assigned_reviewer: string | null;
  reviewer_name: string | null;
  due_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  content_items: {
    id: string;
    title: string | null;
    service_area: string | null;
    status: string | null;
    risk_level: string | null;
    metadata: Record<string, unknown> | null;
  } | null;
  presentation?: PrdPresentationModel;
  debug?: PrdDebugModel;
};

export type ReviewApiResponse = { reviews: ReviewApiRow[]; count: number };

export type ContentJobCreateResponse = {
  job: { id: string };
  queuedRuns: Array<{ id: string }>;
  executedRuns?: Array<{ status?: string; runId?: string | null; message?: string }>;
  review?: {
    id?: string;
    status?: string;
    review_type?: string;
  } | null;
};

export type SystemLogApiRow = {
  id: string;
  event_type: string;
  source: string | null;
  severity: string;
  status: string;
  message: string | null;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  presentation?: Record<string, unknown> | null;
};

export type ErrorLogApiRow = {
  id: string;
  type: string;
  severity: string;
  status: string;
  message: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  presentation?: Record<string, unknown> | null;
};

export type LogsApiResponse = {
  systemLogs: SystemLogApiRow[];
  errorEvents: ErrorLogApiRow[];
  summary: Record<string, number>;
};

export type AgentExecuteResponse = {
  status: string;
  processed: number;
  results: Array<{ status?: string }>;
};

export type RuntimeCandidate = {
  id: 'multica' | 'codex' | 'openai';
  label: string;
  available: boolean;
  priority: number;
  reason: string;
  checks: Record<string, boolean>;
};

export type LocalRuntimeTool = {
  id: string;
  label: string;
  command: string;
  available: boolean;
  path: string | null;
  capabilities: string[];
  reason: string;
};

export type RuntimeDiscoveryResponse = {
  status: 'ready' | 'unavailable';
  preference: AgentRuntimePreference;
  selectedProvider: 'multica' | 'codex' | 'openai' | null;
  candidates: RuntimeCandidate[];
  localTools: LocalRuntimeTool[];
  scanScope: 'server_process';
};

export type RagCitationApiRow = {
  chunkId: string;
  sourceId: string;
  title: string;
  sourceType: string;
  category: string | null;
  score: number;
};

export type RagChatApiResponse = {
  answer: string;
  citations: RagCitationApiRow[];
  blocked: boolean;
  reason?: string;
};

export type RagCitationCard = { source: string; match: string; detail: string };
