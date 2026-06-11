import { NextResponse } from 'next/server';
import { getBufferOAuthConfig } from '@/lib/publishing/buffer-oauth';
import { getFacebookOAuthConfig } from '@/lib/publishing/facebook-oauth';
import { getGoogleDriveOAuthConfig } from '@/lib/integrations/google-drive-oauth';
import { getGoogleDriveServiceAccountConfig } from '@/lib/integrations/google-drive-service-account';
import {
  buildOAuthCallbackUrl,
  OAUTH_PROVIDER_SETUP,
} from '@/lib/publishing/oauth-setup-links';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || origin;
  const buffer = getBufferOAuthConfig();
  const facebook = getFacebookOAuthConfig();
  const googleDrive = getGoogleDriveOAuthConfig();
  const googleDriveServiceAccount = getGoogleDriveServiceAccountConfig();

  return NextResponse.json({
    siteUrl,
    buffer: {
      ...OAUTH_PROVIDER_SETUP.buffer,
      configured: buffer.configured,
      callbackUrl: buildOAuthCallbackUrl(siteUrl, 'buffer'),
      authorizeUrl: `${siteUrl.replace(/\/$/, '')}${OAUTH_PROVIDER_SETUP.buffer.authorizePath}`,
    },
    facebook: {
      ...OAUTH_PROVIDER_SETUP.facebook,
      configured: facebook.configured,
      callbackUrl: buildOAuthCallbackUrl(siteUrl, 'facebook'),
      authorizeUrl: `${siteUrl.replace(/\/$/, '')}${OAUTH_PROVIDER_SETUP.facebook.authorizePath}`,
    },
    google_drive: {
      ...OAUTH_PROVIDER_SETUP.google_drive,
      configured: googleDrive.configured || googleDriveServiceAccount.configured,
      oauthConfigured: googleDrive.configured,
      serviceAccountConfigured: googleDriveServiceAccount.configured,
      serviceAccountEmail: googleDriveServiceAccount.clientEmail,
      authMode: googleDriveServiceAccount.configured
        ? 'service_account'
        : googleDrive.configured
          ? 'oauth'
          : null,
      callbackUrl: buildOAuthCallbackUrl(siteUrl, 'google_drive'),
      authorizeUrl: `${siteUrl.replace(/\/$/, '')}${OAUTH_PROVIDER_SETUP.google_drive.authorizePath}`,
    },
  });
}
