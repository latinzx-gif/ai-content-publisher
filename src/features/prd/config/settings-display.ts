import {
  BufferIcon,
  DriveIcon,
  FacebookIcon,
  InstagramIcon,
  ObsidianIcon,
  TiktokIcon,
  YoutubeIcon,
} from '@/features/prd/components/icons/prd-icons';

export const providerKeyReadiness = [
  {
    provider: 'OpenAI',
    keyName: 'OPENAI_API_KEY',
    status: 'Configured',
    scope: 'Agents, Create Post, RAG answers, image brief generation',
    models: 'GPT-5.4-Mini, GPT-5.4, GPT-5.5',
    required: true,
  },
  {
    provider: 'Supabase',
    keyName: 'SUPABASE_SERVICE_ROLE_KEY',
    status: 'Configured',
    scope: 'Server-side jobs, workflow logs, RAG indexes, publishing queue',
    models: 'Database / Storage / Edge Functions',
    required: true,
  },
  {
    provider: 'Buffer',
    keyName: 'BUFFER_ACCESS_TOKEN',
    status: 'Pending',
    scope: 'Approved content queue and social publishing',
    models: 'Publishing connector',
    required: false,
  },
  {
    provider: 'Vercel',
    keyName: 'VERCEL_TOKEN',
    status: 'Optional',
    scope: 'Deployment inspection and production environment sync',
    models: 'Deploy / env management',
    required: false,
  },
];

export const settingsReadinessChecklist = [
  'Provider keys are masked and never shown in plain text after save.',
  'Codex Local can only operate inside the approved HEAD-OFFICE workspace.',
  'Connected integrations declare source, publishing, or analytics scope.',
  'Every test/connect action should write a workflow log when backend persistence lands.',
];

export const backendDatabaseTables = [
  {
    table: 'content_jobs',
    owner: 'Workflow core',
    purpose: 'Single source of truth for SW-* content lifecycle, canonical status, owner, risk, schedule, and mode.',
    rls: 'Workspace-member read/write; service role for agent jobs only',
    status: 'Required',
  },
  {
    table: 'review_items',
    owner: 'Review Queue',
    purpose: 'Human-in-the-loop package with multilingual drafts, citations, visual brief, selected assets, and decision state.',
    rls: 'Lawyer/accountant/editor roles by workspace',
    status: 'Required',
  },
  {
    table: 'publishing_queue',
    owner: 'Publishing',
    purpose: 'Queued platform sync jobs, retry state, token health snapshot, publish result, and error detail.',
    rls: 'Editors can queue; publishing service can mutate status',
    status: 'Required',
  },
  {
    table: 'agent_runs',
    owner: 'Agents',
    purpose: 'Every OpenAI agent run, model, input/output references, tokens, latency, cost, and handoff target.',
    rls: 'Read by workspace admins; insert by server jobs',
    status: 'Required',
  },
  {
    table: 'system_logs',
    owner: 'Logs',
    purpose: 'Append-only audit trail for safety confirmations, errors, stage audits, agent handoffs, and exports.',
    rls: 'Append-only via server; masked read for workspace users',
    status: 'Required',
  },
  {
    table: 'knowledge_sources',
    owner: 'Knowledge Base',
    purpose: 'PDF/link/Drive/Obsidian source metadata, indexing state, citation policy, and source ownership.',
    rls: 'Workspace scoped with source-level permissions',
    status: 'Required',
  },
  {
    table: 'content_assets',
    owner: 'Asset Composer',
    purpose: 'Generated/selected images, layout metadata, asset prompt, platform crop, and review attachment.',
    rls: 'Workspace scoped; signed storage URLs only',
    status: 'Required',
  },
  {
    table: 'integration_connections',
    owner: 'Settings',
    purpose: 'OAuth/provider state for Google Drive, Obsidian, Facebook, Instagram, Buffer, YouTube, and TikTok.',
    rls: 'Admin only; encrypted token references, never raw token display',
    status: 'Required',
  },
];

export const backendApiContracts = [
  { route: 'POST /api/content/jobs', owner: 'Create Post', input: 'brief, mode, platforms, language, source policy', output: 'content_job + queued agent runs', status: 'Required' },
  { route: 'POST /api/agents/run', owner: 'Agents', input: 'content_job_id, agent_key, model, source refs', output: 'agent_run + next queue state', status: 'Required' },
  { route: 'POST /api/review/decision', owner: 'Review Queue', input: 'review_item_id, decision, reason, reviewer_id', output: 'review update + content status + system log', status: 'Required' },
  { route: 'POST /api/publishing/queue', owner: 'Publishing', input: 'content_job_id, platform targets, scheduled_at', output: 'publishing_queue rows + status event', status: 'Required' },
  { route: 'POST /api/publishing/sync', owner: 'Publishing Agent', input: 'publishing_queue_id, action, safety note', output: 'sync status, error log, retry policy', status: 'Required' },
  { route: 'GET /api/logs/export', owner: 'Logs', input: 'date range, severity, actor, workflow id', output: 'CSV/JSON/PDF export or upgrade-required', status: 'Pro gated' },
  { route: 'POST /api/settings/integrations/test', owner: 'Settings', input: 'provider id, workspace id', output: 'health result + masked diagnostic log', status: 'Required' },
];

export const backendJobQueues = [
  { queue: 'content-generation', trigger: 'Create Post reaches Generation', worker: 'Content Strategy Agent', writes: 'content_jobs, agent_runs, system_logs' },
  { queue: 'asset-composer', trigger: 'Text package completed', worker: 'Image & Layout Agent', writes: 'content_assets, review_items, agent_runs' },
  { queue: 'compliance-check', trigger: 'Ready for Review or manual check', worker: 'Legal Compliance Agent', writes: 'review_items, agent_runs, system_logs' },
  { queue: 'publish-sync', trigger: 'Approve + Auto Queue or Publish Now confirmation', worker: 'Publishing Agent', writes: 'publishing_queue, content_jobs, system_logs' },
  { queue: 'analytics-rollup', trigger: 'Published/failed status or weekly cron', worker: 'Analytics Insight Agent', writes: 'agent_runs, analytics snapshots, system_logs' },
];

export const backendEnvContracts = [
  { key: 'OPENAI_API_KEY', visibility: 'Server only', usedBy: 'Agents, RAG answers, image/layout planning', guard: 'Never expose as NEXT_PUBLIC_*' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', visibility: 'Server only', usedBy: 'Route handlers, workers, append-only logs', guard: 'Never send to browser; use only in server runtime' },
  { key: 'NEXT_PUBLIC_SUPABASE_URL', visibility: 'Client safe', usedBy: 'Browser Supabase client', guard: 'Pair with RLS and scoped anon key' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', visibility: 'Client safe with RLS', usedBy: 'Client reads/writes allowed by policy', guard: 'RLS on every exposed table' },
  { key: 'BUFFER_ACCESS_TOKEN', visibility: 'Server only', usedBy: 'Publishing queue sync', guard: 'Store encrypted or provider-vault reference' },
  { key: 'CODEX_LOCAL_BRIDGE_SECRET', visibility: 'Local/server only', usedBy: 'Signed local Codex/Claude agent bridge', guard: 'Workspace allowlist + per-action audit logs' },
  { key: 'HEAD_OFFICE_CLAUDE_COMMAND', visibility: 'Local/server only', usedBy: 'Claude Code CLI invocation via agent daemon', guard: 'Daemon-only; never expose to browser' },
  { key: 'HEAD_OFFICE_CLAUDE_DEFAULT_MODEL', visibility: 'Local/server only', usedBy: 'Default Claude model for agent daemon runs', guard: 'Override per agent route when needed' },
];

export const backendSecurityChecklist = [
  'Enable RLS on every exposed Supabase table before granting anon/authenticated access.',
  'Service role keys stay inside Next.js route handlers, workers, or Supabase Edge Functions only.',
  'system_logs should be append-only and masked for sensitive values, API keys, and provider tokens.',
  'Review decisions and publishing confirmations require reason/safety metadata before mutation.',
  'Agent runs store references to sources/assets, not raw private documents unless explicitly allowed.',
  'Integration tokens are stored as encrypted references and never rendered back to the browser.',
];

export const backendImplementationHandoff = [
  {
    phase: 'Schema migration',
    owner: 'Supabase DBA',
    deliverable: 'Create workspace-scoped tables for content_jobs, review_items, publishing_queue, agent_runs, system_logs, knowledge_sources, content_assets, and integration_connections.',
    gate: 'Migration reviewed before apply; table names and status enum match UI workflow.',
    status: 'Ready to write',
  },
  {
    phase: 'RLS + grants',
    owner: 'Security reviewer',
    deliverable: 'Enable RLS on exposed tables, grant minimum Data API privileges, and avoid TO authenticated without workspace/ownership predicates.',
    gate: 'Each exposed table has select/insert/update policies with explicit workspace membership checks.',
    status: 'Required',
  },
  {
    phase: 'Server API routes',
    owner: 'Next.js backend',
    deliverable: 'Implement route handlers for content jobs, agent runs, review decisions, publishing queue, publishing sync, integration tests, and log export.',
    gate: 'No service role or provider token is available to client bundles.',
    status: 'Ready to build',
  },
  {
    phase: 'Worker orchestration',
    owner: 'Agent runtime',
    deliverable: 'Connect content-generation, asset-composer, compliance-check, publish-sync, and analytics-rollup jobs to OpenAI agents.',
    gate: 'Every worker writes agent_runs and system_logs before mutating the next workflow state.',
    status: 'Ready to build',
  },
  {
    phase: 'Verification',
    owner: 'QA / audit',
    deliverable: 'Run seed workflow SW-134 from Create Post to Publishing, then confirm Dashboard, Review Queue, Publishing, and Logs agree.',
    gate: 'Supabase advisors, API smoke checks, and browser workflow audit pass before deploy.',
    status: 'Audit gate',
  },
];

export const backendRlsPolicyHandoff = [
  {
    table: 'content_jobs',
    policy: 'workspace_member_can_read_write',
    access: 'Authenticated workspace members can read/write rows for their workspace; server workers can update canonical status.',
  },
  {
    table: 'review_items',
    policy: 'reviewer_role_can_decide',
    access: 'Lawyer, accountant, editor, and admin roles can review; reject and approve mutations require reason metadata.',
  },
  {
    table: 'publishing_queue',
    policy: 'editor_can_queue_service_can_sync',
    access: 'Editors can queue approved jobs; server-only publishing service can mutate sync status and error detail.',
  },
  {
    table: 'system_logs',
    policy: 'append_only_masked_read',
    access: 'Server inserts append-only logs; workspace users read masked events only; raw tokens and secrets never render.',
  },
];

export const backendHandoffChecklist = [
  'Confirm Supabase changelog before migration work, then use current RLS/Data API docs as source of truth.',
  'Create migration through Supabase workflow, not an invented timestamped SQL filename.',
  'Keep service_role and provider tokens server-only; browser uses publishable/anon key with RLS.',
  'Run advisor/security checks after schema, policy, function, or storage changes.',
  'Seed SW-134 as the end-to-end workflow fixture for QA and cross-page status consistency.',
];

export const releaseReadinessGates = [
  {
    gate: 'Frontend workflow QA',
    owner: 'Product QA',
    evidence: 'Create Post, Dashboard simulation, Review Queue, Publishing, Settings, Agents, and Logs pass browser smoke checks.',
    status: 'Ready for preview',
  },
  {
    gate: 'Backend contract freeze',
    owner: 'Backend lead',
    evidence: 'Stage 9 API/table map and Stage 11 handoff package are accepted before real Supabase migration work starts.',
    status: 'Ready for backend',
  },
  {
    gate: 'Environment variables',
    owner: 'Release manager',
    evidence: 'OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, Supabase public URL/anon key, Buffer token, and Vercel token are present only in the correct runtime scope.',
    status: 'Needs production values',
  },
  {
    gate: 'Security review',
    owner: 'Security reviewer',
    evidence: 'RLS policies, Data API grants, secret masking, log export gating, and service role isolation are reviewed.',
    status: 'Required before prod',
  },
  {
    gate: 'Rollback plan',
    owner: 'Release manager',
    evidence: 'Preview deployment can be promoted only after audit; rollback target and release notes are recorded.',
    status: 'Draft ready',
  },
];

export const releaseDeployPath = [
  { step: 'Preview', command: 'vercel deploy', note: 'Create preview URL for product/browser QA without touching production.' },
  { step: 'Inspect', command: 'vercel inspect <preview-url>', note: 'Review build metadata, functions, and deployment details.' },
  { step: 'Smoke test', command: 'npm run lint && browser workflow audit', note: 'Verify /prd, Settings gates, Logs, and seed workflow SW-134.' },
  { step: 'Promote', command: 'vercel promote <preview-url>', note: 'Promote validated preview instead of rebuilding production blindly.' },
  { step: 'Rollback', command: 'vercel rollback', note: 'Return production alias to previous known-good deployment if post-release checks fail.' },
];

export const releaseOpenRisks = [
  'Do not enable real Publish Now until platform tokens and failure retries are tested.',
  'Do not expose log export to Basic plan unless billing/upsell gate is implemented.',
  'Do not connect real Supabase mutations until RLS and workspace membership policies pass advisor checks.',
  'Do not unlock +New Agent until plan limits and billing enforcement are wired server-side.',
];

export const settingsGroups = [
  {
    label: 'My Account',
    items: ['Profile', 'Preferences', 'Notifications', 'API Tokens', 'Daemon', 'Updates'],
  },
  {
    label: 'Agency OS',
    items: ['General', 'Repositories', 'GitHub', 'Codex Local', 'Integrations', 'Labs', 'Members'],
  },
];

export type IntegrationProviderKey = 'google_drive' | 'facebook' | 'buffer';

export const integrationApps = [
  { name: 'Google Drive', description: 'Sync documents, PDFs, folders, Docs, Sheets, and Slides.', status: 'Connect', category: 'Knowledge Source', scope: 'RAG source ingest', auth: 'Service Account or OAuth', lastSync: 'Not connected', readiness: 'Needs setup', icon: DriveIcon, provider: 'google_drive' as const },
  { name: 'Obsidian', description: 'Index markdown vault notes, backlinks, and internal knowledge.', status: 'Connect', category: 'Knowledge Source', scope: 'Local vault import', auth: 'Path approval needed', lastSync: 'Not connected', readiness: 'Needs setup', icon: ObsidianIcon, provider: null },
  { name: 'Facebook', description: 'Publish and schedule posts to your connected Facebook Page.', status: 'Connect', category: 'Publishing', scope: 'Page publishing', auth: 'Facebook OAuth', lastSync: 'Not connected', readiness: 'Needs setup', icon: FacebookIcon, provider: 'facebook' as const },
  { name: 'Instagram', description: 'Prepare visual posts, carousel assets, and caption drafts.', status: 'Connect', category: 'Publishing', scope: 'Asset publishing', auth: 'Business login needed', lastSync: 'Not connected', readiness: 'Needs setup', icon: InstagramIcon, provider: null },
  { name: 'Buffer', description: 'Queue approved content and manage publishing schedules.', status: 'Connect', category: 'Publishing', scope: 'Queue handoff (paused)', auth: 'After demo', lastSync: 'Paused', readiness: 'Needs setup', icon: BufferIcon, provider: 'buffer' as const },
  { name: 'YouTube', description: 'Plan scripts, descriptions, thumbnails, and video publishing.', status: 'Connect', category: 'Publishing', scope: 'Video metadata', auth: 'OAuth needed', lastSync: 'Not connected', readiness: 'Needs setup', icon: YoutubeIcon, provider: null },
  { name: 'TikTok', description: 'Prepare short-form post ideas, scripts, captions, and hashtags.', status: 'Connect', category: 'Publishing', scope: 'Short-form drafts', auth: 'OAuth needed', lastSync: 'Not connected', readiness: 'Needs setup', icon: TiktokIcon, provider: null },
];
