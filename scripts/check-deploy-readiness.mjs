import { spawnSync } from 'node:child_process';

const requiredEnvironmentVariables = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
];

const optionalEnvironmentVariables = [
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_EMBEDDING_MODEL',
  'OPENAI_AGENT_TEXT_MODEL',
  'BUFFER_ACCESS_TOKEN',
  'CODEX_LOCAL_BRIDGE_SECRET',
];

const targetEnvironment = process.argv[2] ?? 'preview';
const effectiveGitBranch = targetEnvironment === 'preview' ? process.env.AI_CONTENT_VERCEL_GIT_BRANCH : null;

const listArgs = ['vercel', 'env', 'ls', targetEnvironment];

if (effectiveGitBranch) {
  listArgs.push(effectiveGitBranch);
}

listArgs.push('--format', 'json');

const result = spawnSync('npx', listArgs, {
  encoding: 'utf8',
  shell: false,
});

if (result.error) {
  console.error(`Unable to run Vercel CLI: ${result.error.message}`);
  process.exit(1);
}

const output = `${result.stdout}\n${result.stderr}`;

if (result.status !== 0) {
  console.error(output.trim());
  process.exit(result.status ?? 1);
}

const envs = parseVercelJsonOutput(result.stdout).envs ?? [];
const envNames = new Set(envs.map((env) => env.key ?? env.name).filter(Boolean));
const missingRequired = requiredEnvironmentVariables.filter((name) => !envNames.has(name));
const missingOptional = optionalEnvironmentVariables.filter((name) => !envNames.has(name));
const configuredRequired = requiredEnvironmentVariables.filter((name) => envNames.has(name));
const configuredOptional = optionalEnvironmentVariables.filter((name) => envNames.has(name));

console.log(
  `Deploy readiness: Vercel ${targetEnvironment}${effectiveGitBranch ? ` (${effectiveGitBranch})` : ''} environment variables`,
);
console.log('');
console.log(`Required configured: ${configuredRequired.length}/${requiredEnvironmentVariables.length}`);
for (const name of requiredEnvironmentVariables) {
  console.log(`- ${name}: ${envNames.has(name) ? 'configured' : 'missing'}`);
}

console.log('');
console.log(`Optional configured: ${configuredOptional.length}/${optionalEnvironmentVariables.length}`);
for (const name of optionalEnvironmentVariables) {
  console.log(`- ${name}: ${envNames.has(name) ? 'configured' : 'missing (default is supported)'}`);
}

if (missingRequired.length > 0) {
  console.log('');
  console.log('Missing required variables:');
  for (const name of missingRequired) {
    console.log(`- ${name}`);
  }
  console.log('');
  console.log('Add them without printing secret values:');
  for (const name of missingRequired) {
    console.log(`npx vercel env add ${name} ${targetEnvironment}${effectiveGitBranch ? ` ${effectiveGitBranch}` : ''}`);
  }
  process.exit(1);
}

if (missingOptional.length > 0) {
  console.log('');
  console.log('Optional variables not configured:');
  for (const name of missingOptional) {
    console.log(`- ${name}`);
  }
}

console.log('');
console.log('Deploy readiness check passed.');

function parseVercelJsonOutput(output) {
  const jsonStart = output.indexOf('{');
  const jsonEnd = output.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
    throw new Error('Unable to parse Vercel env JSON output.');
  }

  return JSON.parse(output.slice(jsonStart, jsonEnd + 1));
}
