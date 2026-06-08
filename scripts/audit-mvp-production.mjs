import { existsSync } from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { loadLocalEnvFiles } from './load-local-env.mjs';

const targetUrl = process.argv[2] ?? 'https://head-office-app.vercel.app';
const reportPath = process.env.AI_CONTENT_MVP_AUDIT_REPORT_PATH ?? 'reports/mvp-production-audit.json';

loadLocalEnvFiles();

const checks = [];

checks.push(runCheck('production env readiness', ['npm', 'run', 'deploy:check', '--', 'production']));
checks.push(runCheck('production deployment alias readiness', ['npx', 'vercel', 'inspect', 'head-office-app.vercel.app']));
checks.push(runCheck('basic production smoke', ['npm', 'run', 'smoke:deploy', '--', targetUrl]));

const hasBearerToken = Boolean(process.env.AI_CONTENT_BEARER_TOKEN);
const hasContentItemId = Boolean(process.env.AI_CONTENT_SMOKE_CONTENT_ID);
const hasSmokeEmail = Boolean(process.env.AI_CONTENT_SMOKE_EMAIL);
const smokeEnvExists = existsSync('.env.smoke.local');

const authenticatedReady = hasBearerToken && hasContentItemId;
const canAutoCreateSmokeUser = hasSmokeEmail && process.env.AI_CONTENT_CONFIRM_CREATE_SMOKE_USER === 'yes';

let authenticatedSmokePassed = false;

if (authenticatedReady) {
  const authenticatedSmokeCheck = runCheck('authenticated production smoke', ['npm', 'run', 'smoke:auth', '--', targetUrl]);
  checks.push(authenticatedSmokeCheck);
  authenticatedSmokePassed = authenticatedSmokeCheck.passed;
}

console.log('');
console.log('MVP production audit summary');
console.log(`targetUrl=${targetUrl}`);
console.log(`smokeEnvFile=${smokeEnvExists ? 'present' : 'missing'}`);
console.log(`smokeBearerToken=${hasBearerToken ? 'configured' : 'missing'}`);
console.log(`smokeContentItemId=${hasContentItemId ? 'configured' : 'missing'}`);
console.log(`smokeEmail=${hasSmokeEmail ? 'configured' : 'missing'}`);
console.log('');

if (authenticatedReady) {
  console.log('Authenticated smoke is ready to run: npm run smoke:auth -- ' + targetUrl);
} else if (canAutoCreateSmokeUser) {
  console.log('Authenticated smoke can be provisioned and run: npm run smoke:prod -- ' + targetUrl);
} else {
  console.log('Authenticated smoke gate is pending.');
  console.log('Set AI_CONTENT_SMOKE_EMAIL and AI_CONTENT_CONFIRM_CREATE_SMOKE_USER=yes, then run npm run smoke:prod.');
}

const basicFailed = checks.filter((check) => check.name !== 'authenticated production smoke' && !check.passed);
const report = {
  generatedAt: new Date().toISOString(),
  targetUrl,
  status: basicFailed.length > 0 ? 'failed_basic_gates' : authenticatedSmokePassed ? 'complete' : authenticatedReady ? 'authenticated_smoke_failed' : 'pending_authenticated_smoke',
  mvpComplete: basicFailed.length === 0 && authenticatedSmokePassed,
  checks,
  smoke: {
    envFile: smokeEnvExists ? 'present' : 'missing',
    bearerToken: hasBearerToken ? 'configured' : 'missing',
    contentItemId: hasContentItemId ? 'configured' : 'missing',
    email: hasSmokeEmail ? 'configured' : 'missing',
    canAutoCreateSmokeUser,
  },
  completionCriteria: {
    productionEnvReady: checks.find((check) => check.name === 'production env readiness')?.passed === true,
    productionAliasReady: checks.find((check) => check.name === 'production deployment alias readiness')?.passed === true,
    basicProductionSmokePassed: checks.find((check) => check.name === 'basic production smoke')?.passed === true,
    authenticatedSmokeReady: authenticatedReady,
    authenticatedSmokePassed,
  },
  nextCommand: authenticatedReady
    ? `npm run smoke:auth -- ${targetUrl}`
    : `AI_CONTENT_SMOKE_EMAIL=<dedicated-test-email> AI_CONTENT_CONFIRM_CREATE_SMOKE_USER=yes npm run smoke:prod -- ${targetUrl}`,
};

writeReport(reportPath, report);
console.log('');
console.log(`Audit report written: ${reportPath}`);

if (basicFailed.length > 0) {
  console.error('');
  console.error('MVP production audit failed basic gates:');
  for (const check of basicFailed) {
    console.error(`- ${check.name}`);
  }
  process.exit(1);
}

if (!authenticatedSmokePassed) {
  process.exitCode = 2;
}

function runCheck(name, args) {
  console.log('');
  console.log(`Running ${name}...`);

  const result = spawnSync(args[0], args.slice(1), {
    env: process.env,
    stdio: 'inherit',
  });

  return {
    name,
    passed: result.status === 0,
  };
}

function writeReport(path, report) {
  const directory = path.split('/').slice(0, -1).join('/');
  const payload = `${JSON.stringify(report, null, 2)}\n`;

  assertNoSecretLikeValues(payload);

  if (directory) {
    mkdirSync(directory, { recursive: true });
  }

  writeFileSync(path, payload);
}

function assertNoSecretLikeValues(payload) {
  const secretPatterns = [
    /sk-[A-Za-z0-9_-]{20,}/,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*[^"\s]+/,
    /OPENAI_API_KEY\s*[:=]\s*[^"\s]+/,
    /AI_CONTENT_BEARER_TOKEN\s*[:=]\s*[^"\s]+/,
  ];

  if (secretPatterns.some((pattern) => pattern.test(payload))) {
    console.error('Refusing to write audit report because it contains a secret-shaped value.');
    process.exit(1);
  }
}
