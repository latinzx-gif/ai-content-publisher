import { createClient } from '@supabase/supabase-js';
import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles();

const targetUrl = process.argv[2];
const bearerToken = process.env.AI_CONTENT_BEARER_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAiKey = process.env.OPENAI_API_KEY;

if (!targetUrl) {
  console.error('Usage: npm run smoke:agent-execution -- http://127.0.0.1:3000');
  process.exit(1);
}

if (!bearerToken) {
  console.error('Missing AI_CONTENT_BEARER_TOKEN. Run smoke:user and smoke:prepare first.');
  process.exit(1);
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase service-role environment for persistence verification.');
  process.exit(1);
}

if (!openAiKey) {
  console.error('Missing OPENAI_API_KEY. Stage 3 live agent execution requires OpenAI.');
  process.exit(1);
}

const baseUrl = normalizeBaseUrl(targetUrl);
const smokeId = `agent-execution-${Date.now()}`;
const authHeaders = {
  authorization: `Bearer ${bearerToken}`,
  'content-type': 'application/json',
};
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const createdJob = await requestJson('/api/content/jobs', {
  method: 'POST',
  expectedStatus: 201,
  headers: authHeaders,
  body: {
    title: `Stage 3 Agent Execution Smoke ${smokeId}`,
    brief: 'Create a short compliant advisory post about Thai company registration duties for SME founders.',
    category: 'Corporate Law',
    serviceArea: 'Corporate Law',
    riskLevel: 'low',
    mode: 'quick',
    languages: ['th', 'en'],
    platforms: ['linkedin'],
    sourcePolicy: 'citation_preferred',
    queueAgents: true,
    metadata: {
      smoke: true,
      smokeId,
      layout: 'carousel',
      imageCount: 2,
      targetAudience: 'SME founders',
      contentGoal: 'Educate & Lead',
      cta: 'Book consultation',
    },
  },
});

const contentJobId = createdJob.body?.job?.id;
const queuedRuns = Array.isArray(createdJob.body?.queuedRuns) ? createdJob.body.queuedRuns : [];

if (!contentJobId || queuedRuns.length < 1) {
  fail('Content job smoke did not return expected job and initial source_search run.');
}

console.log(`PASS create content job: ${createdJob.status} (${queuedRuns.length} initial run(s))`);

for (const run of queuedRuns) {
  await executeRun(run.id, `execute initial ${run.target_type ?? 'agent run'}`);
}

const draftRuns = await fetchRuns(contentJobId, ['draft_generation']);
const draftRun = draftRuns.find((item) => item.target_type === 'draft_generation');

if (!draftRun) {
  fail('Missing queued handoff run for draft_generation.');
}

await executeRun(draftRun.id, 'execute handoff draft_generation');

const nextRuns = await fetchRuns(contentJobId, ['image_layout', 'legal_review']);

for (const taskType of ['image_layout', 'legal_review']) {
  const run = nextRuns.find((item) => item.target_type === taskType);

  if (!run) {
    fail(`Missing queued handoff run for ${taskType}.`);
  }

  await executeRun(run.id, `execute handoff ${taskType}`);
}

const evidence = await verifyPersistence(contentJobId);

console.log(`PASS translations persisted: ${evidence.translations}`);
console.log(`PASS assets persisted: ${evidence.assets}`);
console.log(`PASS review item persisted: ${evidence.reviewItems}`);
console.log(`PASS system logs persisted: ${evidence.systemLogs}`);
console.log('');
console.log('Agent execution smoke passed.');
console.log(`contentJobId=${contentJobId}`);

async function executeRun(runId, label) {
  const response = await requestJson('/api/agents/run', {
    method: 'POST',
    expectedStatus: 200,
    headers: authHeaders,
    body: {
      runId,
      execute: true,
    },
  });

  if (response.body?.status !== 'succeeded') {
    fail(`${label} did not succeed: ${response.body?.status ?? 'unknown'}`);
  }

  console.log(`PASS ${label}: ${response.status}`);
}

async function fetchRuns(contentItemId, taskTypes) {
  const { data, error } = await supabase
    .from('agent_runs')
    .select('id,target_type,status,created_at')
    .eq('target_id', contentItemId)
    .in('target_type', taskTypes)
    .order('created_at', { ascending: true });

  if (error) {
    fail(`Unable to fetch handoff runs: ${error.message}`);
  }

  return data ?? [];
}

async function verifyPersistence(contentItemId) {
  const [translations, assets, reviews, logs] = await Promise.all([
    supabase.from('content_translations').select('id', { count: 'exact', head: true }).eq('content_item_id', contentItemId),
    supabase.from('content_assets').select('id', { count: 'exact', head: true }).eq('content_item_id', contentItemId),
    supabase.from('review_items').select('id', { count: 'exact', head: true }).eq('content_item_id', contentItemId),
    supabase
      .from('system_logs')
      .select('id', { count: 'exact', head: true })
      .eq('target_id', contentItemId)
      .in('event_type', [
        'workflow.source_search_completed',
        'workflow.draft_generation_completed',
        'workflow.image_layout_completed',
      ]),
  ]);

  for (const [name, result] of Object.entries({ translations, assets, reviews, logs })) {
    if (result.error) {
      fail(`Persistence check failed for ${name}: ${result.error.message}`);
    }
  }

  if ((translations.count ?? 0) < 2) {
    fail(`Expected at least 2 translations, found ${translations.count ?? 0}.`);
  }

  if ((assets.count ?? 0) < 1) {
    fail(`Expected at least 1 asset placeholder, found ${assets.count ?? 0}.`);
  }

  if ((reviews.count ?? 0) < 1) {
    fail(`Expected at least 1 review item, found ${reviews.count ?? 0}.`);
  }

  if ((logs.count ?? 0) < 3) {
    fail(`Expected at least 3 workflow system logs, found ${logs.count ?? 0}.`);
  }

  return {
    translations: translations.count ?? 0,
    assets: assets.count ?? 0,
    reviewItems: reviews.count ?? 0,
    systemLogs: logs.count ?? 0,
  };
}

async function requestJson(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method,
    headers: options.headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  const body = text ? safeJson(text) : null;

  if (response.status !== options.expectedStatus) {
    console.error(`FAIL ${options.method} ${path}: ${response.status}, expected ${options.expectedStatus}`);
    if (body?.error || body?.message) {
      console.error(`Reason: ${body.error ?? 'Error'} ${body.message ?? ''}`.trim());
    }
    process.exit(1);
  }

  return { status: response.status, body };
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = '';
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
