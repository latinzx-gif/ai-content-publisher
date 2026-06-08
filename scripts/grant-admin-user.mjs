import { createClient } from '@supabase/supabase-js';
import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles(['.vercel/.env.production.local', '.env.vercel.local', '.env.local']);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const targetEmail = process.env.AI_CONTENT_ADMIN_EMAIL;

if (!supabaseUrl) {
  fail('Missing NEXT_PUBLIC_SUPABASE_URL.');
}

if (!serviceRoleKey) {
  fail('Missing SUPABASE_SERVICE_ROLE_KEY.');
}

if (!targetEmail) {
  fail('Missing AI_CONTENT_ADMIN_EMAIL.');
}

if (process.env.AI_CONTENT_CONFIRM_GRANT_ADMIN !== 'yes') {
  fail(
    'Set AI_CONTENT_CONFIRM_GRANT_ADMIN=yes before running this script. Example: AI_CONTENT_ADMIN_EMAIL=you@domain.com AI_CONTENT_CONFIRM_GRANT_ADMIN=yes node scripts/grant-admin-user.mjs',
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const normalizedEmail = targetEmail.trim().toLowerCase();
const user = await findAuthUserByEmail(normalizedEmail);

if (!user?.id) {
  fail(`Cannot find auth user with email ${normalizedEmail}. Create the user first with Supabase Auth or create-smoke-user.mjs flow.`);
}

let profile = await findProfileByAuthUserId(user.id);

if (!profile?.id) {
  const { data: createdProfile, error: createProfileError } = await supabase
    .from('profiles')
    .insert({
      auth_user_id: user.id,
      display_name: user.email ?? normalizedEmail,
    })
    .select('id, display_name')
    .single();

  if (createProfileError) {
    fail(`Unable to create profile for ${normalizedEmail}: ${createProfileError.message}`);
  }

  profile = createdProfile;
}

const existingMembership = await supabase
  .from('team_members')
  .select('id')
  .eq('profile_id', profile.id)
  .eq('status', 'active')
  .maybeSingle();

if (existingMembership.error) {
  fail(`Unable to check team_members for ${normalizedEmail}: ${existingMembership.error.message}`);
}

if (existingMembership.data?.id) {
  const { error: updateError } = await supabase
    .from('team_members')
    .update({
      role: 'admin',
      can_create: true,
      can_review: true,
      can_approve: true,
      can_publish: true,
      can_manage_settings: true,
      status: 'active',
    })
    .eq('profile_id', profile.id);

  if (updateError) {
    fail(`Unable to update team member role for ${normalizedEmail}: ${updateError.message}`);
  }
} else {
  const { error: insertError } = await supabase
    .from('team_members')
    .insert({
      profile_id: profile.id,
      role: 'admin',
      status: 'active',
      can_create: true,
      can_review: true,
      can_approve: true,
      can_publish: true,
      can_manage_settings: true,
    });

  if (insertError) {
    fail(`Unable to add team member role for ${normalizedEmail}: ${insertError.message}`);
  }
}

console.log('Grant complete.');
console.log(`email=${normalizedEmail}`);
console.log(`profileId=${profile.id}`);
console.log(`authUserId=${user.id}`);

if (process.env.AI_CONTENT_AUTO_SET_DEV_PROFILE === 'yes') {
  const targetFiles = ['.env.local'];
  // keep output idempotent and safe for future runs
  const fs = await import('node:fs');
  for (const file of targetFiles) {
    let output = '';
    if (fs.existsSync(file)) {
      output = fs.readFileSync(file, 'utf8');
    }

    const line = `AI_CONTENT_DEV_PROFILE_ID=${profile.id}`;
    const pattern = /^AI_CONTENT_DEV_PROFILE_ID=.*/m;
    output = pattern.test(output) ? output.replace(pattern, line) : `${output}${output.endsWith('\n') || output.length === 0 ? '' : '\n'}${line}\n`;
    fs.writeFileSync(file, output, { mode: 0o600 });
  }

  console.log('Updated AI_CONTENT_DEV_PROFILE_ID in .env.local');
}

process.exit(0);

async function findAuthUserByEmail(email) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      fail(`Unable to list auth users: ${error.message}`);
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }

    page += 1;
  }

  fail('Unable to find user after scanning 2000 auth users. Please verify the email and retry.');
}

async function findProfileByAuthUserId(authUserId) {
  const { data, error } = await supabase.from('profiles').select('id, display_name').eq('auth_user_id', authUserId).maybeSingle();

  if (error) {
    fail(`Unable to fetch profile for auth user ${authUserId}: ${error.message}`);
  }

  return data;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
