import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles(['.env.local', '.env.vercel.local']);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = (
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  'http://localhost:3001'
).replace(/\/$/, '');
const email = (process.env.E2E_PUBLISHER_EMAIL ?? 'publisher-e2e@headoffice.local').trim().toLowerCase();
const password = process.env.E2E_PUBLISHER_PASSWORD ?? 'Publisher-E2E-Local-Only-2026!';
const outputPath = path.join('playwright', '.auth', 'publisher.json');

if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
  fail('Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

await ensurePublisherUser(email, password);
const playwrightCookies = await createPublisherSessionCookies(email, password);
await saveStorageState(playwrightCookies, outputPath);

console.log(`Saved Playwright auth state to ${outputPath}`);
console.log(`email=${email}`);
console.log('Next: npm run test:e2e:publisher');

async function ensurePublisherUser(userEmail, userPassword) {
  const existing = await findUserByEmail(userEmail);

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: userPassword,
      email_confirm: true,
    });
    if (error) {
      fail(error.message);
    }
    return existing;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: userEmail,
    password: userPassword,
    email_confirm: true,
    user_metadata: {
      purpose: 'publisher-e2e',
      createdBy: 'scripts/save-publisher-playwright-auth.mjs',
    },
  });

  if (error || !data.user) {
    fail(error?.message ?? 'Unable to create E2E publisher user.');
  }

  return data.user;
}

async function findUserByEmail(userEmail) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      fail(error.message);
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === userEmail);
    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }

    page += 1;
  }

  return null;
}

async function createPublisherSessionCookies(userEmail, userPassword) {
  const cookieJar = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieJar.map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          const index = cookieJar.findIndex((entry) => entry.name === cookie.name);
          if (index >= 0) {
            cookieJar[index] = cookie;
          } else {
            cookieJar.push(cookie);
          }
        }
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: userPassword,
  });

  if (error) {
    fail(`Unable to create publisher session: ${error.message}`);
  }

  const { hostname, protocol } = new URL(siteUrl);
  return cookieJar.map(({ name, value, options }) => ({
    name,
    value,
    domain: options?.domain ?? hostname,
    path: options?.path ?? '/',
    httpOnly: options?.httpOnly ?? false,
    secure: options?.secure ?? protocol === 'https:',
    sameSite: normalizeSameSite(options?.sameSite),
    expires:
      typeof options?.maxAge === 'number'
        ? Math.floor(Date.now() / 1000) + options.maxAge
        : options?.expires
          ? Math.floor(new Date(options.expires).getTime() / 1000)
          : -1,
  }));
}

async function saveStorageState(cookies, filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies(cookies);

  const page = await context.newPage();

  try {
    await page.goto(`${siteUrl}/publisher/create`, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.getByRole('heading', { name: 'Create' }).waitFor({ timeout: 30_000 });
    await context.storageState({ path: filePath });
  } finally {
    await browser.close();
  }
}

function normalizeSameSite(value) {
  if (value === 'strict' || value === 'Strict') {
    return 'Strict';
  }
  if (value === 'none' || value === 'None') {
    return 'None';
  }
  return 'Lax';
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
