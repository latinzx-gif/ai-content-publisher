import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const targetEnvironment = process.argv[2] ?? 'preview';
const effectiveGitBranch = targetEnvironment === 'preview' ? process.env.AI_CONTENT_VERCEL_GIT_BRANCH : null;
const envFilePath = process.env.AI_CONTENT_VERCEL_ENV_FILE ?? '.env.vercel.local';
const forceOverwrite = process.env.AI_CONTENT_VERCEL_ENV_FORCE === 'yes';
const dryRun = process.env.AI_CONTENT_VERCEL_ENV_DRY_RUN === 'yes';
const selectedVariableNames = parseSelectedVariableNames(process.env.AI_CONTENT_VERCEL_ENV_NAMES);

const variables = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    sensitive: false,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    sensitive: true,
  },
  {
    name: 'OPENAI_API_KEY',
    required: true,
    sensitive: true,
  },
  {
    name: 'OPENAI_EMBEDDING_MODEL',
    required: false,
    sensitive: false,
  },
  {
    name: 'OPENAI_AGENT_TEXT_MODEL',
    required: false,
    sensitive: false,
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: false,
    sensitive: false,
  },
  {
    name: 'BUFFER_ACCESS_TOKEN',
    required: false,
    sensitive: true,
  },
  {
    name: 'CODEX_LOCAL_BRIDGE_SECRET',
    required: false,
    sensitive: true,
  },
];

const env = readDotenvFile(envFilePath);
const variablesToPush =
  selectedVariableNames.size > 0 ? variables.filter((item) => selectedVariableNames.has(item.name)) : variables;
const unknownSelected = [...selectedVariableNames].filter((name) => !variables.some((item) => item.name === name));
const missing = variablesToPush.filter((item) => item.required && !env[item.name]).map((item) => item.name);

if (unknownSelected.length > 0) {
  console.error('Unknown env names in AI_CONTENT_VERCEL_ENV_NAMES:');
  for (const name of unknownSelected) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

if (missing.length > 0) {
  console.error(`Missing required values in ${envFilePath}:`);
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log(
  `${dryRun ? 'Checking' : 'Pushing'} Vercel environment variables to ${targetEnvironment}${effectiveGitBranch ? ` (${effectiveGitBranch})` : ''} from ${envFilePath}.`,
);
console.log('Secret values will not be printed.');
if (dryRun) {
  console.log('Dry run enabled: no values will be sent to Vercel.');
}
if (selectedVariableNames.size > 0) {
  console.log(`Selected variables: ${[...selectedVariableNames].join(', ')}`);
}
console.log('');

const existingEnvNames = dryRun || forceOverwrite ? new Set() : listExistingEnvNames();

for (const item of variablesToPush) {
  const value = env[item.name];

  if (!value) {
    console.log(`SKIP ${item.name}: optional value not provided`);
    continue;
  }

  if (dryRun) {
    console.log(`READY ${item.name}: ${item.sensitive ? 'sensitive' : 'plain'} value present`);
    continue;
  }

  if (existingEnvNames.has(item.name)) {
    console.log(`SKIP ${item.name}: already configured`);
    continue;
  }

  const args = ['vercel', 'env', 'add', item.name, targetEnvironment];

  if (effectiveGitBranch) {
    args.push(effectiveGitBranch);
  }

  args.push('--yes');

  if (forceOverwrite) {
    args.push('--force');
  }

  if (item.sensitive) {
    args.push('--sensitive');
  } else {
    args.push('--no-sensitive');
  }

  const result = spawnSync('npx', args, {
    encoding: 'utf8',
    input: `${value}\n`,
    shell: false,
  });

  if (result.status !== 0) {
    console.error(
      `FAIL ${item.name}: unable to add to Vercel ${targetEnvironment}${effectiveGitBranch ? ` (${effectiveGitBranch})` : ''}.`,
    );
    const message = `${result.stdout}\n${result.stderr}`.trim();

    if (message) {
      console.error(redactKnownValues(message, Object.values(env)));
    }

    process.exit(result.status ?? 1);
  }

  console.log(`PASS ${item.name}: added to ${targetEnvironment}`);
}

console.log('');
console.log(dryRun ? 'Vercel env dry run completed. Set AI_CONTENT_VERCEL_ENV_DRY_RUN=no or unset it to push.' : 'Vercel env push completed. Run `npm run deploy:check` next.');

function listExistingEnvNames() {
  const listArgs = ['vercel', 'env', 'ls', targetEnvironment];

  if (effectiveGitBranch) {
    listArgs.push(effectiveGitBranch);
  }

  listArgs.push('--format', 'json');

  const result = spawnSync('npx', listArgs, {
    encoding: 'utf8',
    shell: false,
  });

  if (result.status !== 0) {
    console.error(`Unable to list existing Vercel env vars for ${targetEnvironment}.`);
    const message = `${result.stdout}\n${result.stderr}`.trim();

    if (message) {
      console.error(redactKnownValues(message, Object.values(env)));
    }

    process.exit(result.status ?? 1);
  }

  const parsed = parseVercelJsonOutput(result.stdout);
  return new Set((parsed.envs ?? []).map((item) => item.key ?? item.name).filter(Boolean));
}

function parseSelectedVariableNames(value) {
  if (!value) {
    return new Set();
  }

  return new Set(
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function readDotenvFile(path) {
  let content;

  try {
    content = readFileSync(path, 'utf8');
  } catch {
    console.error(`Unable to read ${path}. Create this non-committed file first.`);
    process.exit(1);
  }

  const parsed = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    parsed[key] = unquote(rawValue);
  }

  return parsed;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function redactKnownValues(message, values) {
  let redacted = message;

  for (const value of values) {
    if (!value) {
      continue;
    }

    redacted = redacted.split(value).join('[redacted]');
  }

  return redacted;
}

function parseVercelJsonOutput(output) {
  const jsonStart = output.indexOf('{');
  const jsonEnd = output.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
    throw new Error('Unable to parse Vercel env JSON output.');
  }

  return JSON.parse(output.slice(jsonStart, jsonEnd + 1));
}
