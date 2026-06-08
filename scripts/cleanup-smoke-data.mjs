import { createClient } from '@supabase/supabase-js';
import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const smokeEmail = process.env.AI_CONTENT_SMOKE_EMAIL;
const confirmCleanup = process.env.AI_CONTENT_CONFIRM_CLEANUP_SMOKE;

if (!supabaseUrl) {
  fail('Missing NEXT_PUBLIC_SUPABASE_URL.');
}

if (!serviceRoleKey) {
  fail('Missing SUPABASE_SERVICE_ROLE_KEY.');
}

if (!smokeEmail) {
  fail('Missing AI_CONTENT_SMOKE_EMAIL. Provide the dedicated smoke/test user email to clean up.');
}

if (confirmCleanup !== 'yes') {
  fail('Set AI_CONTENT_CONFIRM_CLEANUP_SMOKE=yes to confirm cleanup of dedicated smoke/test data.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const authUser = await findAuthUserByEmail(smokeEmail);
const profileIds = authUser ? await findProfileIds(authUser.id) : [];
const smokeContentIds = await findSmokeContentIds(profileIds);

if (smokeContentIds.length > 0) {
  await deleteReviewItems(smokeContentIds);
  await deleteContentItems(smokeContentIds);
}

if (profileIds.length > 0) {
  await deactivateSmokeTeamMembers(profileIds);
}

if (authUser) {
  await deleteAuthUser(authUser.id);
}

console.log('Smoke cleanup completed.');
console.log(`email=${smokeEmail}`);
console.log(`authUser=${authUser ? 'deleted' : 'not_found'}`);
console.log(`profilesTouched=${profileIds.length}`);
console.log(`contentItemsDeleted=${smokeContentIds.length}`);

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

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }

    page += 1;
  }

  fail('Unable to find smoke user after scanning 2000 auth users. Refusing cleanup without an exact user match.');
}

async function findProfileIds(authUserId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', authUserId);

  if (error) {
    fail(`Unable to look up smoke profile: ${error.message}`);
  }

  return data.map((profile) => profile.id);
}

async function findSmokeContentIds(profileIds) {
  if (profileIds.length === 0) {
    return [];
  }

  const { data: ownedData, error: ownedError } = await supabase
    .from('content_items')
    .select('id')
    .contains('metadata', { smoke: true })
    .in('created_by', profileIds);

  if (ownedError) {
    fail(`Unable to look up owned smoke content items: ${ownedError.message}`);
  }

  return ownedData.map((item) => item.id);
}

async function deleteReviewItems(contentItemIds) {
  const { error } = await supabase.from('review_items').delete().in('content_item_id', contentItemIds);

  if (error) {
    fail(`Unable to delete smoke review items: ${error.message}`);
  }
}

async function deleteContentItems(contentItemIds) {
  const { error } = await supabase.from('content_items').delete().in('id', contentItemIds);

  if (error) {
    fail(`Unable to delete smoke content items: ${error.message}`);
  }
}

async function deactivateSmokeTeamMembers(profileIds) {
  const { error } = await supabase
    .from('team_members')
    .update({ status: 'inactive' })
    .in('profile_id', profileIds)
    .eq('role', 'smoke_tester');

  if (error) {
    fail(`Unable to deactivate smoke team members: ${error.message}`);
  }
}

async function deleteAuthUser(userId) {
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    fail(`Unable to delete smoke auth user: ${error.message}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
