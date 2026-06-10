import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sanitizeReturnTo } from '@/lib/publishing/oauth-state';

const OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 10,
};

export async function setOAuthCookie(name: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, OAUTH_COOKIE_OPTIONS);
}

export async function readOAuthCookie(name: string) {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value ?? null;
}

export async function clearOAuthCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, '', { ...OAUTH_COOKIE_OPTIONS, maxAge: 0 });
}

export function redirectWithIntegrationStatus(
  returnTo: string,
  provider: 'buffer' | 'facebook',
  status: 'connected' | 'error',
  message?: string
) {
  const url = new URL(returnTo, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001');
  url.searchParams.set('integration', provider);
  url.searchParams.set('integration_status', status);
  if (message) {
    url.searchParams.set('integration_message', message.slice(0, 240));
  }
  return NextResponse.redirect(url);
}

export function resolveReturnTo(value: string | null, fallback: string) {
  return sanitizeReturnTo(value, fallback);
}
