import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles(['.env.local', '.env.vercel.local']);

const bridgeUrl = process.env.CODEX_LOCAL_BRIDGE_URL?.trim();
const bridgeSecret = process.env.CODEX_LOCAL_BRIDGE_SECRET?.trim();
const claudeModel = process.env.HEAD_OFFICE_CLAUDE_DEFAULT_MODEL?.trim() || 'claude-sonnet-4-6';
const timeoutMs = Number(process.env.SMOKE_CLAUDE_BRIDGE_TIMEOUT_MS || '120000');
const appBaseUrl = (process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(
  /\/$/,
  '',
);

if (!bridgeUrl) {
  fail('Missing CODEX_LOCAL_BRIDGE_URL in .env.local');
}

if (!bridgeSecret) {
  fail('Missing CODEX_LOCAL_BRIDGE_SECRET in .env.local');
}

if (!/^https?:\/\//i.test(bridgeUrl)) {
  fail('CODEX_LOCAL_BRIDGE_URL must be an HTTP endpoint');
}

const healthUrl = bridgeUrl.replace(/\/runtime\/execute\/?$/i, '/health');

await checkDaemonHealth();
await checkDaemonDiscovery();
await checkAppRuntimeDiscovery();
await checkClaudeExecute();

console.log('');
console.log('Claude bridge smoke passed.');
console.log(`bridge=${bridgeUrl}`);
console.log(`model=${claudeModel}`);

async function checkDaemonHealth() {
  const response = await fetchWithTimeout(healthUrl, { method: 'GET' });
  const body = await readJson(response);

  if (!response.ok) {
    fail(`Daemon health check failed (${response.status}). Start it with: npm run daemon:agent`);
  }

  const claudeRuntime = Array.isArray(body.runtimes)
    ? body.runtimes.find((runtime) => runtime?.id === 'claude')
    : null;

  if (!claudeRuntime?.available) {
    fail('Daemon is up but Claude runtime is not available. Install the claude CLI and retry.');
  }

  console.log(`PASS daemon health: claude runtime available (${claudeRuntime.path ?? claudeRuntime.command})`);
}

async function checkDaemonDiscovery() {
  const discoveryUrl = bridgeUrl.replace(/\/runtime\/execute\/?$/i, '/runtime/discover');
  const response = await fetchWithTimeout(discoveryUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${bridgeSecret}` },
  });
  const body = await readJson(response);

  if (!response.ok) {
    fail(`Daemon discovery failed (${response.status}): ${body?.error ?? 'unknown error'}`);
  }

  const claudeRuntime = Array.isArray(body.runtimes)
    ? body.runtimes.find((runtime) => runtime?.id === 'claude')
    : null;

  if (!claudeRuntime?.available) {
    fail('Daemon discovery did not report Claude as available.');
  }

  console.log('PASS daemon discovery: Claude runtime listed');
}

async function checkAppRuntimeDiscovery() {
  const response = await fetchWithTimeout(`${appBaseUrl}/api/runtimes?preference=claude`, {
    method: 'GET',
  });
  const body = await readJson(response);

  if (!response.ok) {
    fail(`App runtime discovery failed (${response.status}). Is dev server running at ${appBaseUrl}?`);
  }

  const claudeCandidate = Array.isArray(body.candidates)
    ? body.candidates.find((candidate) => candidate?.id === 'claude')
    : null;

  if (body.selectedProvider !== 'claude' || !claudeCandidate?.available) {
    fail('App /api/runtimes did not select Claude as an available provider.');
  }

  console.log(`PASS app runtime discovery: selectedProvider=${body.selectedProvider}`);
}

async function checkClaudeExecute() {
  const started = Date.now();
  const response = await fetchWithTimeout(bridgeUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bridgeSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'claude',
      model: claudeModel,
      instructions: 'Reply with exactly: CLAUDE_OK',
      input: { task: 'smoke-claude-bridge' },
      responseFormat: 'text',
    }),
  });
  const body = await readJson(response);
  const durationMs = Date.now() - started;

  if (!response.ok) {
    fail(`Claude execute failed (${response.status}): ${body?.error ?? 'unknown error'}`);
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';

  if (!text.includes('CLAUDE_OK')) {
    fail(`Claude execute returned unexpected text: ${text.slice(0, 120) || '(empty)'}`);
  }

  if (body.raw?.provider !== 'claude' && body.usage?.runtime !== 'claude') {
    fail('Claude execute response did not report Claude as the runtime provider.');
  }

  console.log(`PASS claude execute: ${durationMs}ms`);
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      fail(`Request timed out after ${timeoutMs}ms: ${url}`);
    }

    if (url.includes('/health')) {
      fail(`Daemon is not reachable at ${url}. Start it with: npm run daemon:agent`);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(response) {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
