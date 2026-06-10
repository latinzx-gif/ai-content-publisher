'use client';

import { useCallback, useEffect, startTransition, useState } from 'react';
import type { IntegrationProviderKey } from '@/features/prd/config/settings-display';
import type { GoogleDriveConnectionStatus } from '@/lib/integrations/google-drive-client';
import { consumeIntegrationCallbackFlash } from '@/lib/publishing/integration-callback-flash';
import type { PublishingConnectionsStatus } from '@/lib/publishing/publishing-connection-status';

const API_TOKEN_STORAGE_KEY = 'prd_api_bearer_token';

export type IntegrationAppLiveState = {
  status: string;
  readiness: string;
  lastSync: string;
  connected: boolean;
  actionLabel: string;
  disabled?: boolean;
};

function getBearerToken() {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.sessionStorage.getItem(API_TOKEN_STORAGE_KEY) ?? '';
}

const emptyFacebookStatus: PublishingConnectionsStatus = {
  bufferConfigured: false,
  bufferOk: false,
  bufferError: null,
  facebookProfiles: [],
  selectedProfileId: null,
  ready: false,
  bufferOAuthConfigured: false,
  bufferConnected: false,
  facebookOAuthConfigured: false,
  facebookConnected: false,
  facebookPageName: null,
  facebookPageId: null,
};

function buildAuthorizeUrl(provider: IntegrationProviderKey, returnTo: string) {
  return `/api/integrations/${provider === 'google_drive' ? 'google-drive' : provider}/authorize?returnTo=${encodeURIComponent(returnTo)}`;
}

export type IntegrationOAuthSetupHint = {
  callbackUrl: string;
  registerUrl: string;
  envKeys: readonly string[];
  serviceAccountEmail?: string | null;
  mode?: 'service_account' | 'oauth' | null;
};

type OAuthSetupInfo = IntegrationOAuthSetupHint & {
  configured: boolean;
  oauthConfigured?: boolean;
  serviceAccountConfigured?: boolean;
  docsUrl: string;
  setupSteps: readonly string[];
};

type IntegrationSetupInfo = {
  google_drive: OAuthSetupInfo;
  facebook: OAuthSetupInfo;
};

export type GoogleDriveFolderFormState = {
  serviceAccountEmail: string | null;
  folderId: string | null;
  folderUrl: string;
  onFolderUrlChange: (value: string) => void;
  onSaveFolder: () => void;
  saving: boolean;
};

export function useIntegrationConnections(returnTo = '/?page=settings') {
  const [facebookStatus, setFacebookStatus] = useState<PublishingConnectionsStatus>(emptyFacebookStatus);
  const [driveStatus, setDriveStatus] = useState<GoogleDriveConnectionStatus | null>(null);
  const [setupInfo, setSetupInfo] = useState<IntegrationSetupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [driveFolderUrl, setDriveFolderUrl] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getBearerToken();
      const requestInit: RequestInit = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const [facebookResponse, driveResponse] = await Promise.all([
        fetch('/api/settings/facebook/status', requestInit),
        fetch('/api/integrations/google-drive/status', requestInit),
      ]);

      const facebookPayload = (await facebookResponse.json()) as PublishingConnectionsStatus & { error?: string };
      const drivePayload = (await driveResponse.json()) as GoogleDriveConnectionStatus & { error?: string };

      if (facebookResponse.ok) {
        setFacebookStatus(facebookPayload);
      } else {
        setFacebookStatus(emptyFacebookStatus);
      }

      if (driveResponse.ok) {
        setDriveStatus(drivePayload);
        if (drivePayload.folderId) {
          setDriveFolderUrl((current) =>
            current || `https://drive.google.com/drive/folders/${drivePayload.folderId}`
          );
        }
      } else {
        setDriveStatus({
          configured: false,
          connected: false,
          authMode: null,
          accountEmail: null,
          accountName: null,
          folderId: null,
          fileCount: 0,
          recentFiles: [],
          error: drivePayload.error ?? 'Unable to load Google Drive status.',
        });
      }

      const setupResponse = await fetch('/api/integrations/setup');
      if (setupResponse.ok) {
        const setupPayload = (await setupResponse.json()) as IntegrationSetupInfo;
        setSetupInfo(setupPayload);
      }
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Unable to load integration status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      const flash = consumeIntegrationCallbackFlash(['facebook', 'google_drive', 'buffer']);
      if (flash.message) {
        setNotice(flash.message);
      }
      if (flash.error) {
        setError(flash.error);
      }
      void refresh();
    });
  }, [refresh]);

  const getAppLiveState = useCallback(
    (provider: IntegrationProviderKey | null): IntegrationAppLiveState | null => {
      if (provider === 'facebook') {
        const connected = facebookStatus.facebookConnected;
        return {
          connected,
          status: connected ? 'Connected' : 'Connect',
          readiness: connected ? 'Ready' : facebookStatus.facebookOAuthConfigured ? 'Needs setup' : 'Needs setup',
          lastSync: connected
            ? facebookStatus.facebookPageName ?? 'Page connected'
            : facebookStatus.facebookOAuthConfigured
              ? 'Not connected'
              : 'OAuth not configured',
          actionLabel: connected ? 'Disconnect' : 'Connect',
          disabled: !facebookStatus.facebookOAuthConfigured && !connected,
        };
      }

      if (provider === 'google_drive') {
        const serviceAccountMode =
          driveStatus?.authMode === 'service_account' || setupInfo?.google_drive.serviceAccountConfigured === true;
        const configured = driveStatus?.configured ?? setupInfo?.google_drive.configured ?? false;
        const connected = Boolean(driveStatus?.connected);

        if (serviceAccountMode) {
          const fileLabel =
            connected && driveStatus?.fileCount
              ? `${driveStatus.fileCount} files in folder`
              : driveStatus?.folderId
                ? 'Folder saved, waiting for files'
                : 'Paste shared folder link';
          return {
            connected,
            status: connected ? 'Connected' : 'Connect',
            readiness: connected ? 'Ready' : configured ? 'Needs folder' : 'Needs setup',
            lastSync: connected ? fileLabel : configured ? 'Share folder with service account' : 'Service account not configured',
            actionLabel: connected ? 'Disconnect' : 'Save folder',
            disabled: !configured,
          };
        }

        return {
          connected,
          status: connected ? 'Connected' : 'Connect',
          readiness: connected ? 'Ready' : configured ? 'Needs setup' : 'Needs setup',
          lastSync: connected
            ? driveStatus?.accountName ?? driveStatus?.accountEmail ?? 'Account connected'
            : configured
              ? 'Not connected'
              : 'OAuth not configured',
          actionLabel: connected ? 'Disconnect' : 'Connect',
          disabled: !configured && !connected,
        };
      }

      if (provider === 'buffer') {
        return {
          connected: false,
          status: 'Paused',
          readiness: 'Needs setup',
          lastSync: 'Paused for demo',
          actionLabel: 'Connect',
          disabled: true,
        };
      }

      return null;
    },
    [driveStatus, facebookStatus, setupInfo]
  );

  const connect = useCallback(
    (provider: IntegrationProviderKey) => {
      if (provider === 'buffer') {
        setNotice('Buffer is paused for this demo. Use Facebook for live publishing.');
        return;
      }

      if (provider === 'google_drive') {
        const serviceAccountMode =
          driveStatus?.authMode === 'service_account' || setupInfo?.google_drive.serviceAccountConfigured === true;
        if (serviceAccountMode) {
          setError('Paste a shared folder link in the Google Drive card, then click Save folder.');
          return;
        }
        if (!(driveStatus?.configured ?? setupInfo?.google_drive.configured)) {
          setError('Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_CLIENT_ID/SECRET in .env.local, then restart npm run dev.');
          return;
        }
      }

      if (provider === 'facebook' && !facebookStatus.facebookOAuthConfigured) {
        setError('Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env.local, then restart npm run dev.');
        return;
      }

      window.location.href = buildAuthorizeUrl(provider, returnTo);
    },
    [driveStatus?.configured, facebookStatus.facebookOAuthConfigured, returnTo, setupInfo?.google_drive.configured]
  );

  const disconnect = useCallback(
    async (provider: IntegrationProviderKey) => {
      if (provider === 'buffer') {
        return;
      }

      const label = provider === 'google_drive' ? 'Google Drive' : 'Facebook';
      if (!window.confirm(`Disconnect ${label}?`)) {
        return;
      }

      setActionLoading(provider);
      setError(null);

      try {
        const token = getBearerToken();
        const response = await fetch('/api/integrations/disconnect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ provider }),
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? `Unable to disconnect ${label}.`);
        }
        setNotice(`${label} disconnected.`);
        await refresh();
      } catch (disconnectError) {
        setError(disconnectError instanceof Error ? disconnectError.message : `Unable to disconnect ${label}.`);
      } finally {
        setActionLoading(null);
      }
    },
    [refresh]
  );

  const saveDriveFolder = useCallback(async () => {
    if (!driveFolderUrl.trim()) {
      setError('Paste a Google Drive folder link or folder ID.');
      return;
    }

    setActionLoading('google_drive');
    setError(null);

    try {
      const token = getBearerToken();
      const response = await fetch('/api/integrations/google-drive/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ folderUrl: driveFolderUrl.trim() }),
      });
      const payload = (await response.json()) as { error?: string; fileCount?: number };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save Google Drive folder.');
      }
      setNotice(
        typeof payload.fileCount === 'number'
          ? `Google Drive folder connected (${payload.fileCount} files found).`
          : 'Google Drive folder connected.'
      );
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save Google Drive folder.');
    } finally {
      setActionLoading(null);
    }
  }, [driveFolderUrl, refresh]);

  const handleAppAction = useCallback(
    async (provider: IntegrationProviderKey | null, appName: string) => {
      if (!provider) {
        setNotice(`${appName} connector is planned for a later phase.`);
        return;
      }

      const live = getAppLiveState(provider);
      if (!live) {
        return;
      }

      if (provider === 'google_drive') {
        const serviceAccountMode =
          driveStatus?.authMode === 'service_account' || setupInfo?.google_drive.serviceAccountConfigured === true;
        if (serviceAccountMode) {
          if (live.connected) {
            await disconnect(provider);
            return;
          }
          await saveDriveFolder();
          return;
        }
      }

      if (live.connected) {
        await disconnect(provider);
        return;
      }

      connect(provider);
    },
    [connect, disconnect, driveStatus?.authMode, getAppLiveState, saveDriveFolder, setupInfo?.google_drive.serviceAccountConfigured]
  );

  const googleDriveFolderForm: GoogleDriveFolderFormState | null =
    driveStatus?.authMode === 'service_account' || setupInfo?.google_drive.serviceAccountConfigured
      ? {
          serviceAccountEmail:
            driveStatus?.accountEmail ?? setupInfo?.google_drive.serviceAccountEmail ?? null,
          folderId: driveStatus?.folderId ?? null,
          folderUrl: driveFolderUrl,
          onFolderUrlChange: setDriveFolderUrl,
          onSaveFolder: () => {
            void saveDriveFolder();
          },
          saving: actionLoading === 'google_drive',
        }
      : null;

  const wiredConnectedCount = [
    getAppLiveState('google_drive')?.connected,
    getAppLiveState('facebook')?.connected,
  ].filter(Boolean).length;

  return {
    loading,
    notice,
    error,
    actionLoading,
    wiredConnectedCount,
    setupInfo,
    googleDriveFolderForm,
    refresh,
    getAppLiveState,
    handleAppAction,
  };
}
