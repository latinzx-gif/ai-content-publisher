import { exchangeBufferAuthorizationCode } from '@/lib/publishing/buffer-oauth';
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
  const oauthError = searchParams.get('error');
  const storedState = await readOAuthCookie('buffer_oauth_state');
  const returnTo = resolveReturnTo(
    await readOAuthCookie('buffer_oauth_return_to'),
    '/publisher/settings'
  );

  await clearOAuthCookie('buffer_oauth_state');
  await clearOAuthCookie('buffer_oauth_return_to');

  if (!storedState || !state || storedState !== state) {
    return redirectWithIntegrationStatus(returnTo, 'buffer', 'error', 'Invalid OAuth state.');
  }

  if (oauthError) {
    return redirectWithIntegrationStatus(returnTo, 'buffer', 'error', oauthError);
  }

  if (!code) {
    return redirectWithIntegrationStatus(returnTo, 'buffer', 'error', 'Missing authorization code.');
  }

  try {
    const token = await exchangeBufferAuthorizationCode(code);
    await saveProviderAccessToken({
      provider: 'buffer',
      accessToken: token.accessToken,
      accountName: 'Buffer account',
      expiresAt: token.expiresAt,
      metadata: { source: 'oauth' },
    });

    return redirectWithIntegrationStatus(returnTo, 'buffer', 'connected');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Buffer login failed.';
    return redirectWithIntegrationStatus(returnTo, 'buffer', 'error', message);
  }
}
