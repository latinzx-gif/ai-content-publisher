export const OAUTH_PROVIDER_SETUP = {
  buffer: {
    label: 'Buffer',
    registerUrl: 'https://publish.buffer.com/settings/api',
    docsUrl: 'https://developers.buffer.com/guides/authentication.html',
    legacyDocsUrl: 'https://buffer.com/developers/api/oauth',
    envKeys: ['BUFFER_CLIENT_ID', 'BUFFER_CLIENT_SECRET'] as const,
    callbackPath: '/api/integrations/buffer/callback',
    authorizePath: '/api/integrations/buffer/authorize',
    setupSteps: [
      'Open Buffer API settings and create an OAuth application.',
      'Paste the redirect URI shown below into the app settings.',
      'Copy Client ID and Client Secret into .env.local, then restart npm run dev.',
      'Return here and click Login.',
    ],
  },
  facebook: {
    label: 'Facebook',
    registerUrl: 'https://developers.facebook.com/apps/create/',
    docsUrl: 'https://developers.facebook.com/docs/development/create-an-app',
    envKeys: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'] as const,
    callbackPath: '/api/integrations/facebook/callback',
    authorizePath: '/api/integrations/facebook/authorize',
    setupSteps: [
      'Create a Meta app (Business type recommended).',
      'Add Facebook Login product and paste the redirect URI below.',
      'Copy App ID and App Secret into .env.local, then restart npm run dev.',
      'Return here and click Login, then approve your Facebook Page.',
    ],
  },
} as const;

export type OAuthProviderKey = keyof typeof OAUTH_PROVIDER_SETUP;

export function buildOAuthCallbackUrl(origin: string, provider: OAuthProviderKey) {
  const path = OAUTH_PROVIDER_SETUP[provider].callbackPath;
  return `${origin.replace(/\/$/, '')}${path}`;
}
