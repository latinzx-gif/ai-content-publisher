import { createClient } from '@supabase/supabase-js';
import { createDecipheriv, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index);
    let value = line.slice(index + 1);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function getEncryptionKey(env) {
  const configured = env.INTEGRATION_TOKEN_ENCRYPTION_KEY?.trim();
  if (configured) {
    return createHash('sha256').update(configured).digest();
  }
  return createHash('sha256').update(`integration-token:${env.SUPABASE_SERVICE_ROLE_KEY}`).digest();
}

function decryptSecret(payload, env) {
  const [ivPart, authTagPart, encryptedPart] = payload.split('.');
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(env), Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

const env = loadEnv();
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const postId = process.env.ACP_TEST_POST_ID ?? 'fb-schedule-test-20260610';
const runLive = process.env.ACP_TEST_LIVE_SCHEDULE === 'yes';

const content = {
  primary_language: 'Thai',
  secondary_language: 'English',
  primary: {
    headline: '[TEST] Facebook schedule smoke',
    subheadline: 'Publisher /publishing Facebook-only test',
    support_line: '',
    long_form: 'This is a scheduled test post from Content OS. Safe to delete after verification.',
    hashtags: '#ContentOS #TestPost',
    disclaimer: 'Automated schedule test.',
  },
  secondary: {
    headline: '[TEST] Facebook schedule smoke',
    subheadline: 'Publisher publishing test',
    support_line: '',
    long_form: 'Scheduled test post.',
    hashtags: '#ContentOS',
    disclaimer: '',
  },
  generated_at: new Date().toISOString(),
};

const scheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
const scheduledLocal = scheduledAt.toISOString().slice(0, 16);

console.log('Seeding approved Facebook post:', postId);
await db.from('acp_posts').upsert({
  post_id: postId,
  status: 'approved',
  platform: 'Facebook',
  brand: 'PaySlip AI',
  primary_lang: 'Thai',
  secondary_lang: 'English',
  metadata: { source: 'seed-facebook-schedule-test' },
});

await db.from('acp_post_content').upsert({
  post_id: postId,
  content,
});

const { data: facebookIntegration } = await db
  .from('integrations')
  .select('id')
  .eq('provider', 'facebook')
  .maybeSingle();

const { data: account } = await db
  .from('integration_accounts')
  .select('id, external_account_id, account_name, status')
  .eq('integration_id', facebookIntegration.id)
  .eq('status', 'connected')
  .maybeSingle();

if (!account) {
  console.error('No connected Facebook account found.');
  process.exit(1);
}

const { data: tokenRow } = await db
  .from('integration_tokens')
  .select('encrypted_token')
  .eq('integration_account_id', account.id)
  .eq('token_type', 'access_token')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

if (!tokenRow?.encrypted_token) {
  console.error('No Facebook page token found.');
  process.exit(1);
}

const pageToken = decryptSecret(tokenRow.encrypted_token, env);
console.log('Connected Page:', account.account_name, account.external_account_id);

if (!runLive) {
  console.log('\nSeed complete.');
  console.log('Open: http://localhost:3001/publisher/publishing');
  console.log('Pick schedule time (>= 10 min future):', scheduledLocal.replace('T', ' '));
  console.log('To run live schedule from CLI: ACP_TEST_LIVE_SCHEDULE=yes node scripts/seed-facebook-schedule-test.mjs');
  process.exit(0);
}

const scheduledUnix = Math.floor(scheduledAt.getTime() / 1000);
const message = [
  content.primary.headline,
  content.primary.subheadline,
  content.primary.long_form,
  content.primary.hashtags,
  content.primary.disclaimer,
].filter(Boolean).join('\n\n');

const response = await fetch(`https://graph.facebook.com/v21.0/${account.external_account_id}/feed`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    message,
    access_token: pageToken,
    published: 'false',
    scheduled_publish_time: String(scheduledUnix),
  }),
});

const payload = await response.json();
console.log('Facebook response:', JSON.stringify(payload, null, 2));

if (!response.ok || !payload.id) {
  process.exit(1);
}

await db.from('acp_posts').update({
  status: 'scheduled',
  scheduled_at: scheduledAt.toISOString(),
}).eq('post_id', postId);

await db.from('acp_audit_logs').insert({
  type: 'publish',
  action: 'Schedule',
  post_id: postId,
  details: `Facebook scheduled for ${scheduledAt.toISOString()}. ID: ${payload.id}`,
  status: 'success',
  agent: 'Facebook Publisher',
});

console.log('Live Facebook schedule success:', payload.id);
