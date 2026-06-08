import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles();

const targetUrl = process.argv[2];
const bearerToken = process.env.AI_CONTENT_BEARER_TOKEN;
const contentItemId = process.env.AI_CONTENT_SMOKE_CONTENT_ID;

if (!targetUrl) {
  console.error('Usage: npm run smoke:auth -- https://your-preview-url.vercel.app');
  process.exit(1);
}

if (!bearerToken) {
  console.error('Missing AI_CONTENT_BEARER_TOKEN. Provide a valid Supabase user bearer token via environment variable.');
  process.exit(1);
}

if (!contentItemId) {
  console.error('Missing AI_CONTENT_SMOKE_CONTENT_ID. Provide an existing accessible content_items.id via environment variable.');
  process.exit(1);
}

const baseUrl = normalizeBaseUrl(targetUrl);
const authHeaders = {
  authorization: `Bearer ${bearerToken}`,
  'content-type': 'application/json',
};

const health = await requestJson('/api/health', {
  method: 'GET',
  expectedStatus: 200,
});

console.log(`PASS runtime health: ${health.status}`);

const createdReview = await requestJson('/api/reviews', {
  method: 'POST',
  expectedStatus: 201,
  headers: authHeaders,
  body: {
    contentItemId,
    reviewType: 'legal',
    riskLevel: 'low',
  },
});
const reviewId = createdReview.body?.review?.id;

if (!reviewId) {
  console.error('Create review succeeded but response did not include review.id.');
  process.exit(1);
}

console.log(`PASS create review: ${createdReview.status}`);

const approveReview = await requestJson('/api/reviews/action', {
  method: 'POST',
  expectedStatus: 200,
  headers: authHeaders,
  body: {
    reviewItemId: reviewId,
    action: 'approve',
    note: 'Authenticated smoke approval',
  },
});

console.log(`PASS approve review: ${approveReview.status}`);
console.log('');
console.log('Authenticated smoke passed.');

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
