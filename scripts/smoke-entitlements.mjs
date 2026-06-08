import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles();

const targetUrl = process.argv[2];
const bearerToken = process.env.AI_CONTENT_BEARER_TOKEN;
const expectLockedPlan = process.env.AI_CONTENT_EXPECT_LOCKED_PLAN !== 'no';

if (!targetUrl) {
  console.error('Usage: npm run smoke:entitlements -- http://127.0.0.1:3000');
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

const checks = [
  {
    name: 'agent route premium lock',
    path: '/api/agents/route-task',
    expectedFeature: 'agent_routes',
    enabledStatus: 400,
    body: {},
  },
  {
    name: 'publishing sync premium lock',
    path: '/api/publishing/sync',
    expectedFeature: 'publishing_integrations',
    enabledStatus: 400,
    body: {},
  },
];

for (const check of checks) {
  const response = await fetch(`${baseUrl}${check.path}`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(check.body),
  });
  const body = await readJson(response);

  if (expectLockedPlan) {
    if (response.status !== 402 || body?.feature !== check.expectedFeature || body?.upgradeRequired !== true) {
      fail(`${check.name} expected 402 ${check.expectedFeature}, got ${response.status} ${JSON.stringify(body)}`);
    }

    console.log(`PASS ${check.name}: 402 (${check.expectedFeature})`);
    continue;
  }

  if (response.status !== check.enabledStatus) {
    fail(`${check.name} expected enabled-plan validation status ${check.enabledStatus}, got ${response.status}`);
  }

  console.log(`PASS ${check.name}: enabled plan reached request validation (${response.status})`);
}

console.log('');
console.log('Entitlement smoke passed.');

async function readJson(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
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
  console.error(`FAIL ${message}`);
  process.exit(1);
}
