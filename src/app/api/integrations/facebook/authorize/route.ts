import { NextResponse } from 'next/server';
import { buildFacebookAuthorizeUrl, getFacebookOAuthConfig } from '@/lib/publishing/facebook-oauth';
import { createOAuthState } from '@/lib/publishing/oauth-state';
import { resolveReturnTo, setOAuthCookie } from '@/lib/publishing/oauth-routes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = resolveReturnTo(searchParams.get('returnTo'), '/publisher/settings');
  const config = getFacebookOAuthConfig();

  if (!config.configured) {
    return NextResponse.json(
      { error: 'FACEBOOK_APP_ID and FACEBOOK_APP_SECRET must be configured before Facebook login.' },
      { status: 503 }
    );
  }

  const state = createOAuthState();
  await setOAuthCookie('facebook_oauth_state', state);
  await setOAuthCookie('facebook_oauth_return_to', returnTo);

  const authorizeUrl = buildFacebookAuthorizeUrl(state);
  return NextResponse.redirect(authorizeUrl);
}
