import { exchangeFacebookAuthorizationCode } from '@/lib/publishing/facebook-oauth';
import { saveProviderAccessToken } from '@/lib/publishing/integration-connection-store';
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
  const storedState = await readOAuthCookie('facebook_oauth_state');
  const returnTo = resolveReturnTo(
    await readOAuthCookie('facebook_oauth_return_to'),
    '/publisher/settings'
  );

  await clearOAuthCookie('facebook_oauth_state');
  await clearOAuthCookie('facebook_oauth_return_to');

  if (!storedState || !state || storedState !== state) {
    return redirectWithIntegrationStatus(returnTo, 'facebook', 'error', 'Invalid OAuth state.');
  }

  if (oauthError) {
    return redirectWithIntegrationStatus(returnTo, 'facebook', 'error', oauthError);
  }

  if (!code) {
    return redirectWithIntegrationStatus(returnTo, 'facebook', 'error', 'Missing authorization code.');
  }

  try {
    const result = await exchangeFacebookAuthorizationCode(code);
    await saveProviderAccessToken({
      provider: 'facebook',
      accessToken: result.page.accessToken,
      accountName: result.page.name,
      externalAccountId: result.page.id,
      expiresAt: result.expiresAt,
      metadata: {
        source: 'oauth',
        pageId: result.page.id,
        pageName: result.page.name,
        availablePages: result.pages.map((page) => ({ id: page.id, name: page.name })),
      },
    });

    return redirectWithIntegrationStatus(returnTo, 'facebook', 'connected');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Facebook login failed.';
    return redirectWithIntegrationStatus(returnTo, 'facebook', 'error', message);
  }
}
