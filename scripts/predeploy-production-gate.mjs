import { spawnSync } from 'node:child_process';

const localSmokeUrl = process.env.AI_CONTENT_LOCAL_SMOKE_URL ?? 'http://127.0.0.1:3000';

const checks = [
  {
    name: 'production env readiness',
    args: ['npm', 'run', 'deploy:check', '--', 'production'],
  },
  {
    name: 'production build',
    args: ['npm', 'run', 'build'],
  },
  {
    name: 'local deploy smoke',
    args: ['npm', 'run', 'smoke:deploy', '--', localSmokeUrl],
  },
  {
    name: 'entitlement lock smoke',
    args: ['npm', 'run', 'smoke:entitlements', '--', localSmokeUrl],
  },
];

console.log('Production predeploy gate');
console.log(`localSmokeUrl=${localSmokeUrl}`);
console.log('No deployment or secret transmission will be performed by this script.');

for (const check of checks) {
  console.log('');
  console.log(`Running ${check.name}...`);

  const result = spawnSync(check.args[0], check.args.slice(1), {
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    console.error('');
    console.error(`Predeploy gate failed: ${check.name}`);
    process.exit(result.status ?? 1);
  }
}

console.log('');
console.log('Production predeploy gate passed.');
console.log('Next side-effecting step requires explicit approval: npx vercel deploy --prebuilt --prod');
