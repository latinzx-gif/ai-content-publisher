const FACEBOOK_AUTHORIZE_URL = 'https://www.facebook.com/v21.0/dialog/oauth';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v21.0/oauth/access_token';
const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v21.0';

const FACEBOOK_SCOPES = [
  'pages_show_list',
  'pages_manage_posts',
  'pages_read_engagement',
  'business_management',
].join(',');

export type FacebookPageOption = {
  id: string;
  name: string;
  accessToken: string;
};

export function getFacebookOAuthConfig() {
  const appId = process.env.FACEBOOK_APP_ID?.trim();
  const appSecret = process.env.FACEBOOK_APP_SECRET?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? 'http://localhost:3001';
  const redirectUri = `${siteUrl.replace(/\/$/, '')}/api/integrations/facebook/callback`;

  return {
    appId,
    appSecret,
    redirectUri,
    configured: Boolean(appId && appSecret),
  };
}

export function buildFacebookAuthorizeUrl(state: string) {
  const { appId, redirectUri, configured } = getFacebookOAuthConfig();
  if (!configured || !appId) {
    throw new Error('FACEBOOK_APP_ID and FACEBOOK_APP_SECRET must be configured.');
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: FACEBOOK_SCOPES,
    state,
  });

  return `${FACEBOOK_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeFacebookAuthorizationCode(code: string) {
  const { appId, appSecret, redirectUri, configured } = getFacebookOAuthConfig();
  if (!configured || !appId || !appSecret) {
    throw new Error('FACEBOOK_APP_ID and FACEBOOK_APP_SECRET must be configured.');
  }

  const tokenUrl = new URL(FACEBOOK_TOKEN_URL);
  tokenUrl.searchParams.set('client_id', appId);
  tokenUrl.searchParams.set('client_secret', appSecret);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const response = await fetch(tokenUrl);
  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error?.message ?? `Facebook token exchange failed (${response.status}).`);
  }

  const pages = await fetchFacebookPages(payload.access_token);
  const primaryPage = pages[0];
  if (!primaryPage) {
    throw new Error('No Facebook Pages were returned for this account. Approve Page access during login.');
  }

  const expiresAt =
    typeof payload.expires_in === 'number'
      ? new Date(Date.now() + payload.expires_in * 1000).toISOString()
      : null;

  return {
    userAccessToken: payload.access_token,
    page: primaryPage,
    pages,
    expiresAt,
  };
}

async function fetchFacebookPages(userAccessToken: string): Promise<FacebookPageOption[]> {
  const url = new URL(`${FACEBOOK_GRAPH_URL}/me/accounts`);
  url.searchParams.set('access_token', userAccessToken);
  url.searchParams.set('fields', 'id,name,access_token');

  const response = await fetch(url);
  const payload = (await response.json()) as {
    data?: Array<{ id?: string; name?: string; access_token?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Facebook pages lookup failed (${response.status}).`);
  }

  return (payload.data ?? [])
    .filter((page): page is { id: string; name: string; access_token: string } =>
      Boolean(page.id && page.name && page.access_token)
    )
    .map((page) => ({
      id: page.id,
      name: page.name,
      accessToken: page.access_token,
    }));
}
