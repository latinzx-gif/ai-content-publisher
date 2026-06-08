import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles(['.vercel/.env.production.local', '.env.vercel.local']);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const smokeEmail = process.env.AI_CONTENT_SMOKE_EMAIL;
const smokePassword = process.env.AI_CONTENT_SMOKE_PASSWORD ?? generatePassword();
const confirmCreate = process.env.AI_CONTENT_CONFIRM_CREATE_SMOKE_USER;
const outputPath = process.env.AI_CONTENT_SMOKE_ENV_PATH ?? '.env.smoke.local';

if (!supabaseUrl) {
  fail('Missing NEXT_PUBLIC_SUPABASE_URL.');
}

if (!serviceRoleKey) {
  fail('Missing SUPABASE_SERVICE_ROLE_KEY.');
}

if (!smokeEmail) {
  fail('Missing AI_CONTENT_SMOKE_EMAIL. Use a dedicated smoke/test email address.');
}

if (confirmCreate !== 'yes') {
  fail('Set AI_CONTENT_CONFIRM_CREATE_SMOKE_USER=yes to confirm this is a dedicated smoke/test user.');
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const authClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const createdUser = await upsertSmokeUser();
const accessToken = await createSmokeSession();
writeSmokeEnv(accessToken);

console.log('Smoke user ready.');
console.log(`email=${smokeEmail}`);
console.log(`userId=${createdUser.id}`);
console.log(`envFile=${outputPath}`);
console.log('');
console.log('Bearer token was written to the smoke env file and was not printed.');
console.log('Next: load .env.vercel.local and the smoke env file, then run npm run smoke:prepare.');

async function upsertSmokeUser() {
  const { data, error } = await adminClient.auth.admin.createUser({
    email: smokeEmail,
    password: smokePassword,
    email_confirm: true,
    user_metadata: {
      purpose: 'ai-content-platform-smoke-test',
      createdBy: 'scripts/create-smoke-user.mjs',
    },
  });

  if (error) {
    if (!isExistingUserError(error.message)) {
      fail(`Unable to create smoke user: ${error.message}`);
    }

    return updateExistingSmokeUser();
  }

  if (!data.user?.id) {
    fail('Smoke user creation returned no user id.');
  }

  return data.user;
}

async function updateExistingSmokeUser() {
  const existingUser = await findAuthUserByEmail(smokeEmail);

  if (!existingUser?.id) {
    fail('Smoke user appears to exist, but an exact auth user match was not found.');
  }

  const { data, error } = await adminClient.auth.admin.updateUserById(existingUser.id, {
    password: smokePassword,
    email_confirm: true,
    user_metadata: {
      ...(existingUser.user_metadata ?? {}),
      purpose: 'ai-content-platform-smoke-test',
      updatedBy: 'scripts/create-smoke-user.mjs',
    },
  });

  if (error) {
    fail(`Unable to update existing smoke user: ${error.message}`);
  }

  if (!data.user?.id) {
    fail('Existing smoke user update returned no user id.');
  }

  return data.user;
}

async function findAuthUserByEmail(email) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      fail(`Unable to list auth users: ${error.message}`);
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }

    page += 1;
  }

  fail('Unable to find smoke user after scanning 2000 auth users. Refusing to update without an exact user match.');
}

function isExistingUserError(message) {
  return /already|registered|exists/i.test(message);
}

async function createSmokeSession() {
  const { data, error } = await authClient.auth.signInWithPassword({
    email: smokeEmail,
    password: smokePassword,
  });

  if (error) {
    fail(`Unable to create smoke user session: ${error.message}`);
  }

  if (!data.session?.access_token) {
    fail('Smoke user session returned no access token.');
  }

  return data.session.access_token;
}

function writeSmokeEnv(accessToken) {
  const values = {
    AI_CONTENT_BEARER_TOKEN: accessToken,
    AI_CONTENT_CONFIRM_SMOKE_USER: 'yes',
  };

  if (!process.env.AI_CONTENT_SMOKE_PASSWORD) {
    values.AI_CONTENT_SMOKE_PASSWORD = smokePassword;
  }

  let existing = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '';

  for (const [name, value] of Object.entries(values)) {
    const line = `${name}=${value}`;
    const pattern = new RegExp(`^${escapeRegExp(name)}=.*$`, 'm');
    existing = pattern.test(existing)
      ? existing.replace(pattern, line)
      : existing + (existing && !existing.endsWith('\n') ? '\n' : '') + line + '\n';
  }

  writeFileSync(outputPath, existing, { mode: 0o600 });
}

function generatePassword() {
  return `Smoke-${randomBytes(24).toString('base64url')}!1`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
