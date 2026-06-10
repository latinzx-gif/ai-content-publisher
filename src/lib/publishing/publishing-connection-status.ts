import { getFacebookConnectionStatus, type FacebookConnectionStatus } from '@/lib/publishing/buffer-facebook-status';
import { getBufferOAuthConfig } from '@/lib/publishing/buffer-oauth';
import { getFacebookOAuthConfig } from '@/lib/publishing/facebook-oauth';
import { getStoredFacebookConnection } from '@/lib/publishing/integration-connection-store';

export type PublishingConnectionsStatus = FacebookConnectionStatus & {
  bufferOAuthConfigured: boolean;
  bufferConnected: boolean;
  facebookOAuthConfigured: boolean;
  facebookConnected: boolean;
  facebookPageName: string | null;
  facebookPageId: string | null;
};

export async function getPublishingConnectionsStatus(): Promise<PublishingConnectionsStatus> {
  const [bufferStatus, facebookStored] = await Promise.all([
    getFacebookConnectionStatus(),
    getStoredFacebookConnection(),
  ]);

  const bufferOAuth = getBufferOAuthConfig();
  const facebookOAuth = getFacebookOAuthConfig();

  return {
    ...bufferStatus,
    bufferOAuthConfigured: bufferOAuth.configured,
    bufferConnected: bufferStatus.bufferConfigured && bufferStatus.bufferOk,
    facebookOAuthConfigured: facebookOAuth.configured,
    facebookConnected: Boolean(facebookStored?.accessToken),
    facebookPageName: facebookStored?.accountName ?? null,
    facebookPageId: facebookStored?.externalAccountId ?? null,
  };
}
