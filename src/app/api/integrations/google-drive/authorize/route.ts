import { NextResponse } from 'next/server';
import { buildGoogleDriveAuthorizeUrl, getGoogleDriveOAuthConfig } from '@/lib/integrations/google-drive-oauth';
import { createOAuthState } from '@/lib/publishing/oauth-state';
import { redirectWithIntegrationStatus, resolveReturnTo, setOAuthCookie } from '@/lib/publishing/oauth-routes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = resolveReturnTo(searchParams.get('returnTo'), '/?page=settings');
  const config = getGoogleDriveOAuthConfig();

  if (!config.configured) {
    return redirectWithIntegrationStatus(
      returnTo,
      'google_drive',
      'error',
      'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local, then restart npm run dev.'
    );
  }

  const state = createOAuthState();
  await setOAuthCookie('google_drive_oauth_state', state);
  await setOAuthCookie('google_drive_oauth_return_to', returnTo);

  return NextResponse.redirect(buildGoogleDriveAuthorizeUrl(state));
}
