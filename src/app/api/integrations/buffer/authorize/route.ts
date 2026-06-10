import { NextResponse } from 'next/server';
import { buildBufferAuthorizeUrl, getBufferOAuthConfig } from '@/lib/publishing/buffer-oauth';
import { createOAuthState } from '@/lib/publishing/oauth-state';
import { resolveReturnTo, setOAuthCookie } from '@/lib/publishing/oauth-routes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = resolveReturnTo(searchParams.get('returnTo'), '/publisher/settings');
  const config = getBufferOAuthConfig();

  if (!config.configured) {
    return NextResponse.json(
      { error: 'BUFFER_CLIENT_ID and BUFFER_CLIENT_SECRET must be configured before Buffer login.' },
      { status: 503 }
    );
  }

  const state = createOAuthState();
  await setOAuthCookie('buffer_oauth_state', state);
  await setOAuthCookie('buffer_oauth_return_to', returnTo);

  const authorizeUrl = buildBufferAuthorizeUrl(state);
  return NextResponse.redirect(authorizeUrl);
}
