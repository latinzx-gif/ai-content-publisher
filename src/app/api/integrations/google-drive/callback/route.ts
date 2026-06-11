import { exchangeGoogleDriveAuthorizationCode } from '@/lib/integrations/google-drive-oauth';
import { saveProviderAccessToken } from '@/lib/integrations/integration-connection-store';
import {
  clearOAuthCookie,
  readOAuthCookie,
  redirectWithIntegrationStatus,
  resolveReturnTo,
} from '@/lib/publishing/oauth-routes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error');
  const storedState = await readOAuthCookie('google_drive_oauth_state');
  const returnTo = resolveReturnTo(
    await readOAuthCookie('google_drive_oauth_return_to'),
    '/?page=knowledge-base'
  );

  await clearOAuthCookie('google_drive_oauth_state');
  await clearOAuthCookie('google_drive_oauth_return_to');

  if (!storedState || !state || storedState !== state) {
    return redirectWithIntegrationStatus(returnTo, 'google_drive', 'error', 'Invalid OAuth state.');
  }

  if (oauthError) {
    return redirectWithIntegrationStatus(returnTo, 'google_drive', 'error', oauthError);
  }

  if (!code) {
    return redirectWithIntegrationStatus(returnTo, 'google_drive', 'error', 'Missing authorization code.');
  }

  try {
    const result = await exchangeGoogleDriveAuthorizationCode(code);
    await saveProviderAccessToken({
      provider: 'google_drive',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      accountName: result.accountName ?? result.accountEmail,
      externalAccountId: result.externalAccountId ?? result.accountEmail,
      expiresAt: result.expiresAt,
      metadata: {
        source: 'oauth',
        email: result.accountEmail,
      },
    });

    return redirectWithIntegrationStatus(returnTo, 'google_drive', 'connected');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google Drive login failed.';
    return redirectWithIntegrationStatus(returnTo, 'google_drive', 'error', message);
  }
}
