import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bearerToken = process.env.AI_CONTENT_BEARER_TOKEN;
const confirmSmokeUser = process.env.AI_CONTENT_CONFIRM_SMOKE_USER;
const displayName = process.env.AI_CONTENT_SMOKE_DISPLAY_NAME ?? 'Smoke Test Reviewer';
const title = process.env.AI_CONTENT_SMOKE_TITLE ?? `Smoke review fixture ${new Date().toISOString()}`;
const allowedSmokeRoles = ['admin', 'lawyer', 'accountant', 'editor', 'viewer'];
const role = process.env.AI_CONTENT_SMOKE_ROLE ?? 'lawyer';

if (!allowedSmokeRoles.includes(role)) {
  fail(`Invalid AI_CONTENT_SMOKE_ROLE=${role}. Allowed roles: ${allowedSmokeRoles.join(', ')}`);
}

if (!supabaseUrl) {
  fail('Missing NEXT_PUBLIC_SUPABASE_URL.');
}

if (!serviceRoleKey) {
  fail('Missing SUPABASE_SERVICE_ROLE_KEY.');
}

if (!bearerToken) {
  fail('Missing AI_CONTENT_BEARER_TOKEN. Provide a valid Supabase user bearer token.');
}

if (confirmSmokeUser !== 'yes') {
  fail('Set AI_CONTENT_CONFIRM_SMOKE_USER=yes to confirm this bearer token belongs to a dedicated smoke/test user.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const authUser = await getValidatedAuthUser();
const profile = await upsertProfile(authUser.id);
await upsertActiveTeamMember(profile.id);
const contentItem = await createSmokeContentItem(profile.id);
writeSmokeEnv(contentItem.id);

console.log('Smoke fixture ready.');
console.log(`profileId=${profile.id}`);
console.log(`contentItemId=${contentItem.id}`);
console.log('');
console.log('Use this content item for authenticated smoke:');
console.log(`AI_CONTENT_SMOKE_CONTENT_ID=${contentItem.id}`);
console.log('');
console.log('Smoke content item id was written to .env.smoke.local.');

async function upsertProfile(authUserId) {
  const { data: existingProfile, error: existingError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (existingError) {
    fail(`Unable to look up profile: ${existingError.message}`);
  }

  if (existingProfile) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', existingProfile.id)
      .select('id, display_name')
      .single();

    if (error) {
      fail(`Unable to update profile: ${error.message}`);
    }

    return data;
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      auth_user_id: authUserId,
      display_name: displayName,
    })
    .select('id, display_name')
    .single();

  if (error) {
    fail(`Unable to create profile. Confirm the bearer token belongs to an existing Supabase auth user. ${error.message}`);
  }

  return data;
}

async function upsertActiveTeamMember(profileId) {
const memberPayload = {
    role,
    status: 'active',
    can_create: true,
    can_review: true,
    can_approve: true,
    can_publish: role === 'admin',
    can_manage_settings: role === 'admin',
  };

  const { data: existingMember, error: existingError } = await supabase
    .from('team_members')
    .select('id, can_create, can_review, can_approve, can_publish, can_manage_settings')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (existingError) {
    fail(`Unable to look up team member: ${existingError.message}`);
  }

  if (existingMember) {
    if (
      existingMember.can_create !== true ||
      existingMember.can_review !== true ||
      existingMember.can_approve !== true ||
      (role === 'admin' && (existingMember.can_publish !== true || existingMember.can_manage_settings !== true))
    ) {
      fail(
        'Existing team member does not have the required smoke permissions. Refusing to escalate an existing user. Use a dedicated smoke user or grant permissions intentionally.',
      );
    }

    return;
  }

  const { error } = await supabase.from('team_members').insert({
    profile_id: profileId,
    ...memberPayload,
  });

  if (error) {
    fail(`Unable to create team member permissions: ${error.message}`);
  }
}

async function getValidatedAuthUser() {
  const { data, error } = await supabase.auth.getUser(bearerToken);

  if (error || !data.user) {
    fail('AI_CONTENT_BEARER_TOKEN is invalid or expired.');
  }

  return data.user;
}

async function createSmokeContentItem(profileId) {
  const { data, error } = await supabase
    .from('content_items')
    .insert({
      title,
      brief: 'Dedicated smoke fixture for authenticated review workflow. Safe to approve during deployment smoke tests.',
      category: 'legal',
      service_area: 'smoke_test',
      status: 'draft',
      risk_level: 'low',
      created_by: profileId,
      assigned_to: profileId,
      metadata: {
        smoke: true,
        createdBy: 'scripts/prepare-smoke-fixture.mjs',
      },
    })
    .select('id, title')
    .single();

  if (error) {
    fail(`Unable to create smoke content item: ${error.message}`);
  }

  return data;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function writeSmokeEnv(contentItemId) {
  const path = process.env.AI_CONTENT_SMOKE_ENV_PATH ?? '.env.smoke.local';
  const line = `AI_CONTENT_SMOKE_CONTENT_ID=${contentItemId}`;
  const pattern = /^AI_CONTENT_SMOKE_CONTENT_ID=.*$/m;
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const updated = pattern.test(existing)
    ? existing.replace(pattern, line)
    : existing + (existing && !existing.endsWith('\n') ? '\n' : '') + line + '\n';

  writeFileSync(path, updated, { mode: 0o600 });
}
