const BUFFER_LEGACY_AUTHORIZE_URL = 'https://buffer.com/oauth2/authorize';
const BUFFER_LEGACY_TOKEN_URL = 'https://api.bufferapp.com/1/oauth2/token.json';

export function getBufferOAuthConfig() {
  const clientId = process.env.BUFFER_CLIENT_ID?.trim();
  const clientSecret = process.env.BUFFER_CLIENT_SECRET?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? 'http://localhost:3001';
  const redirectUri = `${siteUrl.replace(/\/$/, '')}/api/integrations/buffer/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri,
    configured: Boolean(clientId && clientSecret),
  };
}

export function buildBufferAuthorizeUrl(state: string) {
  const { clientId, redirectUri, configured } = getBufferOAuthConfig();
  if (!configured || !clientId) {
    throw new Error('BUFFER_CLIENT_ID and BUFFER_CLIENT_SECRET must be configured.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });

  return `${BUFFER_LEGACY_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeBufferAuthorizationCode(code: string) {
  const { clientId, clientSecret, redirectUri, configured } = getBufferOAuthConfig();
  if (!configured || !clientId || !clientSecret) {
    throw new Error('BUFFER_CLIENT_ID and BUFFER_CLIENT_SECRET must be configured.');
  }

  const response = await fetch(BUFFER_LEGACY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      grant_type: 'authorization_code',
    }),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    message?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error ?? payload.message ?? `Buffer token exchange failed (${response.status}).`);
  }

  const expiresAt =
    typeof payload.expires_in === 'number'
      ? new Date(Date.now() + payload.expires_in * 1000).toISOString()
      : null;

  return {
    accessToken: payload.access_token,
    expiresAt,
  };
}
