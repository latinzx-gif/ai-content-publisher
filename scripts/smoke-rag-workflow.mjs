import { createClient } from '@supabase/supabase-js';
import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles();

const targetUrl = process.argv[2];
const bearerToken = process.env.AI_CONTENT_BEARER_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAiKey = process.env.OPENAI_API_KEY;

if (!targetUrl) {
  console.error('Usage: npm run smoke:rag-workflow -- http://127.0.0.1:3000');
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
  console.error('Missing OPENAI_API_KEY. Stage 4 RAG smoke requires OpenAI embeddings and agent execution.');
  process.exit(1);
}

const baseUrl = normalizeBaseUrl(targetUrl);
const smokeId = `rag-workflow-${Date.now()}`;
const authHeaders = {
  authorization: `Bearer ${bearerToken}`,
  'content-type': 'application/json',
};
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const knowledgeText = [
  'Thai company registration duties for SME founders include reserving a company name, preparing a memorandum of association, holding a statutory meeting, registering incorporation with the Department of Business Development, and maintaining required corporate records.',
  'After incorporation, the company should keep shareholder registers, meeting minutes, accounting records, and file required updates when directors, addresses, or registered capital change.',
  'This internal guideline is approved for content generation. It should be cited when drafting educational social posts about Thai company registration duties for SME founders.',
].join('\n\n');

const source = await requestJson('/api/knowledge/sources', {
  method: 'POST',
  expectedStatus: 200,
  headers: authHeaders,
  body: {
    title: `Stage 4 RAG Smoke Source ${smokeId}`,
    sourceType: 'internal_guideline',
    category: 'Corporate Law',
    origin: 'Stage 4 smoke fixture',
    metadata: {
      smoke: true,
      smokeId,
    },
  },
});

const knowledgeSourceId = source.body?.source?.id;

if (!knowledgeSourceId) {
  fail('Knowledge source create succeeded but did not return source.id.');
}

console.log(`PASS create knowledge source: ${source.status}`);

const processed = await requestJson('/api/knowledge/process', {
  method: 'POST',
  expectedStatus: 200,
  headers: authHeaders,
  body: {
    knowledgeSourceId,
    text: knowledgeText,
  },
});

if (!processed.body?.chunkCount) {
  fail('Knowledge process succeeded but did not create chunks.');
}

console.log(`PASS process knowledge source: ${processed.status} (${processed.body.chunkCount} chunk(s))`);

const ragChat = await requestJson('/api/rag/chat', {
  method: 'POST',
  expectedStatus: 200,
  headers: authHeaders,
  body: {
    question: 'What duties should Thai SME founders know after company registration?',
    category: 'Corporate Law',
    strictCitation: true,
  },
});

if (ragChat.body?.blocked || !Array.isArray(ragChat.body?.citations) || ragChat.body.citations.length === 0) {
  fail(`RAG chat did not return usable citations: ${ragChat.body?.reason ?? 'unknown reason'}`);
}

console.log(`PASS RAG chat citations: ${ragChat.status} (${ragChat.body.citations.length} citation(s))`);

const contentJob = await requestJson('/api/content/jobs', {
  method: 'POST',
  expectedStatus: 201,
  headers: authHeaders,
  body: {
    title: `Stage 4 RAG Agent Smoke ${smokeId}`,
    brief: 'Draft an educational post about Thai company registration duties for SME founders using only approved knowledge sources.',
    category: 'Corporate Law',
    serviceArea: 'Corporate Law',
    riskLevel: 'low',
    mode: 'quick',
    languages: ['th', 'en'],
    platforms: ['linkedin'],
    sourcePolicy: 'knowledge_base_required',
    queueAgents: true,
    metadata: {
      smoke: true,
      smokeId,
      sourcePolicy: 'knowledge_base_required',
      targetAudience: 'SME founders',
    },
  },
});

const contentJobId = contentJob.body?.job?.id;
const sourceSearchRun = Array.isArray(contentJob.body?.queuedRuns)
  ? contentJob.body.queuedRuns.find((run) => run.target_type === 'source_search')
  : null;

if (!contentJobId || !sourceSearchRun?.id) {
  fail('Content job did not return source_search run.');
}

console.log(`PASS create RAG-backed content job: ${contentJob.status}`);

const executed = await requestJson('/api/agents/run', {
  method: 'POST',
  expectedStatus: 200,
  headers: authHeaders,
  body: {
    runId: sourceSearchRun.id,
    execute: true,
  },
});

if (executed.body?.status !== 'succeeded') {
  fail(`source_search execution did not succeed: ${executed.body?.status ?? 'unknown'}`);
}

console.log(`PASS execute RAG source_search: ${executed.status}`);

const evidence = await verifyPersistence({ contentJobId, knowledgeSourceId });

console.log(`PASS source citations persisted: ${evidence.citationCount}`);
console.log(`PASS RAG query persisted: ${evidence.ragQueries}`);
console.log(`PASS RAG logs persisted: ${evidence.systemLogs}`);
console.log('');
console.log('RAG workflow smoke passed.');
console.log(`knowledgeSourceId=${knowledgeSourceId}`);
console.log(`contentJobId=${contentJobId}`);

async function verifyPersistence({ contentJobId, knowledgeSourceId }) {
  const [content, ragQueries, logs] = await Promise.all([
    supabase.from('content_items').select('id,status,metadata').eq('id', contentJobId).single(),
    supabase.from('rag_queries').select('id,citations,created_at').order('created_at', { ascending: false }).limit(20),
    supabase
      .from('system_logs')
      .select('id,event_type,target_id,metadata,created_at')
      .in('event_type', ['workflow.rag_chat', 'workflow.source_search_completed'])
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  if (content.error) {
    fail(`Unable to verify content sourceSearch metadata: ${content.error.message}`);
  }

  if (ragQueries.error) {
    fail(`Unable to verify rag query persistence: ${ragQueries.error.message}`);
  }

  if (logs.error) {
    fail(`Unable to verify RAG system logs: ${logs.error.message}`);
  }

  const citations = content.data?.metadata?.sourceSearch?.citations;
  const citationCount = Array.isArray(citations) ? citations.length : 0;

  if (citationCount < 1) {
    fail('Expected sourceSearch citations to be persisted on content item metadata.');
  }

  const matchingRagQueries = (ragQueries.data ?? []).filter((query) =>
    Array.isArray(query.citations) && query.citations.some((citation) => citation?.sourceId === knowledgeSourceId),
  );
  const matchingLogs = (logs.data ?? []).filter((log) => log.target_id === contentJobId || log.metadata?.question || log.metadata?.query);

  if (matchingRagQueries.length < 1) {
    fail('Expected at least one persisted rag_queries row with citations.');
  }

  if (matchingLogs.length < 1) {
    fail('Expected at least one RAG/system log row.');
  }

  return {
    citationCount,
    ragQueries: matchingRagQueries.length,
    systemLogs: matchingLogs.length,
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
