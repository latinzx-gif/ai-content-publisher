import { spawnSync } from 'node:child_process';
import { loadLocalEnvFiles } from './load-local-env.mjs';

const targetUrl = process.argv[2] ?? 'https://head-office-app.vercel.app';

loadLocalEnvFiles();

if (!process.env.AI_CONTENT_BEARER_TOKEN) {
  if (process.env.AI_CONTENT_SMOKE_EMAIL && process.env.AI_CONTENT_CONFIRM_CREATE_SMOKE_USER === 'yes') {
    runScript('create-smoke-user.mjs');
    loadLocalEnvFiles();
  }
}

if (!process.env.AI_CONTENT_BEARER_TOKEN) {
  fail([
    'Missing AI_CONTENT_BEARER_TOKEN.',
    'To create a dedicated smoke user automatically, set:',
    'AI_CONTENT_SMOKE_EMAIL=smoke-test@example.com',
    'AI_CONTENT_CONFIRM_CREATE_SMOKE_USER=yes',
    '',
    'Then rerun: npm run smoke:prod',
  ].join('\n'));
}

if (!process.env.AI_CONTENT_SMOKE_CONTENT_ID) {
  runScript('prepare-smoke-fixture.mjs');
  loadLocalEnvFiles();
}

if (!process.env.AI_CONTENT_SMOKE_CONTENT_ID) {
  fail('Missing AI_CONTENT_SMOKE_CONTENT_ID after smoke fixture preparation.');
}

runScript('smoke-authenticated-flow.mjs', [targetUrl]);

console.log('');
console.log('Production smoke passed. Regenerating MVP audit report...');
runScript('audit-mvp-production.mjs', [targetUrl]);

function runScript(scriptName, args = []) {
  const result = spawnSync(process.execPath, [`scripts/${scriptName}`, ...args], {
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
