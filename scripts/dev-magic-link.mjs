// Generate a publisher magic-link locally WITHOUT sending email.
// Bypasses Supabase's built-in email rate limit (~2 emails/hour project-wide).
//
// Usage:
//   node scripts/dev-magic-link.mjs you@example.com
//   SITE_URL=http://localhost:3000 node scripts/dev-magic-link.mjs you@example.com
//
// Prints an action link — open it in the browser to sign in.

import { createClient } from '@supabase/supabase-js';
import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles(['.env.local', '.env.vercel.local']);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.argv[2] ?? '').trim().toLowerCase();
const siteUrl = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/$/, '');

if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/dev-magic-link.mjs <email>');
  process.exit(1);
}
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.generateLink({
  type: 'magiclink',
  email,
  options: { redirectTo: `${siteUrl}/publisher/login` },
});

if (error) {
  if (/not found/i.test(error.message)) {
    console.error(`No account for ${email}. Sign in once via the login form first (creates the user), or use an existing account email.`);
  } else {
    console.error(error.message);
  }
  process.exit(1);
}

console.log('Open this link in your browser to sign in (valid for a short time, one use):');
console.log('');
console.log(data.properties.action_link);
