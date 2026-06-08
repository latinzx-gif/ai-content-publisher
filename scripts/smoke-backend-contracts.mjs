import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles();

const targetUrl = process.argv[2];
const bearerToken = process.env.AI_CONTENT_BEARER_TOKEN;

if (!targetUrl) {
  console.error('Usage: npm run smoke:backend-contracts -- http://127.0.0.1:3000');
  process.exit(1);
}

if (!bearerToken) {
  console.error('Missing AI_CONTENT_BEARER_TOKEN. Run smoke:user and smoke:prepare first.');
  process.exit(1);
}

const baseUrl = normalizeBaseUrl(targetUrl);
const authHeaders = {
  authorization: `Bearer ${bearerToken}`,
  'content-type': 'application/json',
};

const smokeId = `backend-contract-${Date.now()}`;
const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

const health = await requestJson('/api/health', {
  method: 'GET',
  expectedStatus: 200,
});

console.log(`PASS runtime health: ${health.status}`);

const createdJob = await requestJson('/api/content/jobs', {
  method: 'POST',
  expectedStatus: 201,
  headers: authHeaders,
  body: {
    title: `Backend contract smoke ${smokeId}`,
    brief: 'Smoke test for backend implementation contracts and workflow persistence.',
    category: 'legal',
    serviceArea: 'backend_smoke',
    riskLevel: 'low',
    mode: 'manual',
    languages: ['th', 'en'],
    platforms: ['linkedin'],
    sourcePolicy: 'knowledge_base_required',
    queueAgents: true,
    metadata: {
      smoke: true,
      smokeId,
    },
  },
});

const contentJobId = createdJob.body?.job?.id;

if (!contentJobId) {
  fail('Create content job succeeded but response did not include job.id.');
}

const queuedRunCount = Array.isArray(createdJob.body?.queuedRuns) ? createdJob.body.queuedRuns.length : 0;
console.log(`PASS create content job: ${createdJob.status} (${queuedRunCount} run(s) queued)`);

const queuedAgent = await requestJson('/api/agents/run', {
  method: 'POST',
  expectedStatus: 202,
  headers: authHeaders,
  body: {
    taskType: 'draft_generation',
    targetId: contentJobId,
    riskLevel: 'low',
    input: {
      smoke: true,
      smokeId,
      source: 'backend_contract_smoke',
    },
  },
});

const agentRunId = queuedAgent.body?.run?.id ?? queuedAgent.body?.queued?.run?.id;

if (!agentRunId) {
  fail('Queue agent run succeeded but response did not include run.id.');
}

console.log(`PASS queue agent run: ${queuedAgent.status}`);

const createdReview = await requestJson('/api/reviews', {
  method: 'POST',
  expectedStatus: 201,
  headers: authHeaders,
  body: {
    contentItemId: contentJobId,
    reviewType: 'legal',
    riskLevel: 'low',
  },
});

const reviewItemId = createdReview.body?.review?.id;

if (!reviewItemId) {
  fail('Create review succeeded but response did not include review.id.');
}

console.log(`PASS create review: ${createdReview.status}`);

const approvedReview = await requestJson('/api/review/decision', {
  method: 'POST',
  expectedStatus: 200,
  headers: authHeaders,
  body: {
    reviewItemId,
    decision: 'approve',
    reason: 'Backend contract smoke approval',
  },
});

console.log(`PASS approve review decision: ${approvedReview.status}`);

const queuedPublishing = await requestJson('/api/review/decision', {
  method: 'POST',
  expectedStatus: [200, 402],
  headers: authHeaders,
  body: {
    reviewItemId,
    decision: 'auto_queue',
    platform: 'linkedin',
    scheduledAt,
    reason: 'Backend contract smoke auto queue',
  },
});

if (queuedPublishing.status === 402) {
  if (queuedPublishing.body?.feature !== 'publishing_integrations' || queuedPublishing.body?.upgradeRequired !== true) {
    fail('Auto queue returned 402 but did not include the expected publishing_integrations lock payload.');
  }

  console.log(`PASS publishing premium lock: ${queuedPublishing.status} (${queuedPublishing.body.feature})`);
  console.log('');
  console.log('Backend contract smoke passed with publishing integrations locked for the current plan.');
  console.log(`contentJobId=${contentJobId}`);
  console.log(`agentRunId=${agentRunId}`);
  console.log(`reviewItemId=${reviewItemId}`);
  process.exit(0);
}

const publishingQueueId = queuedPublishing.body?.queue?.id;

if (!publishingQueueId) {
  fail('Auto queue succeeded but response did not include queue.id.');
}

console.log(`PASS auto queue publishing: ${queuedPublishing.status}`);

const syncedPublishing = await requestJson('/api/publishing/sync', {
  method: 'POST',
  expectedStatus: 200,
  headers: authHeaders,
  body: {
    queueId: publishingQueueId,
    action: 'mark_published',
    externalPostId: `smoke-${smokeId}`,
    metadata: {
      smoke: true,
      smokeId,
    },
  },
});

if (syncedPublishing.body?.queue?.status !== 'published') {
  fail('Publishing sync succeeded but queue status is not published.');
}

console.log(`PASS publishing sync: ${syncedPublishing.status}`);
console.log('');
console.log('Backend contract smoke passed.');
console.log(`contentJobId=${contentJobId}`);
console.log(`agentRunId=${agentRunId}`);
console.log(`reviewItemId=${reviewItemId}`);
console.log(`publishingQueueId=${publishingQueueId}`);

async function requestJson(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method,
    headers: options.headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  const body = text ? safeJson(text) : null;

  const expectedStatuses = Array.isArray(options.expectedStatus) ? options.expectedStatus : [options.expectedStatus];

  if (!expectedStatuses.includes(response.status)) {
    console.error(`FAIL ${options.method} ${path}: ${response.status}, expected ${expectedStatuses.join(' or ')}`);
    if (body?.error || body?.message) {
      console.error(`Reason: ${body.error ?? 'Error'} ${body.message ?? ''}`.trim());
    }
    process.exit(1);
  }

  return {
    status: response.status,
    body,
  };
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
