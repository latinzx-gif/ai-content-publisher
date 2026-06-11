import { getStoredGoogleDriveConnection } from '@/lib/integrations/integration-connection-store';
import { resolveGoogleDriveFolderId } from '@/lib/integrations/google-drive-folder';
import {
  getGoogleDriveServiceAccountAccessToken,
  getGoogleDriveServiceAccountConfig,
} from '@/lib/integrations/google-drive-service-account';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';

export type GoogleDriveFileSummary = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string | null;
  webViewLink: string | null;
};

export type GoogleDriveAuthMode = 'service_account' | 'oauth' | null;

export type GoogleDriveConnectionStatus = {
  configured: boolean;
  connected: boolean;
  authMode: GoogleDriveAuthMode;
  accountEmail: string | null;
  accountName: string | null;
  folderId: string | null;
  fileCount: number;
  recentFiles: GoogleDriveFileSummary[];
  error: string | null;
};

function emptyStatus(partial: Partial<GoogleDriveConnectionStatus> = {}): GoogleDriveConnectionStatus {
  return {
    configured: false,
    connected: false,
    authMode: null,
    accountEmail: null,
    accountName: null,
    folderId: null,
    fileCount: 0,
    recentFiles: [],
    error: null,
    ...partial,
  };
}

export async function getGoogleDriveConnectionStatus(): Promise<GoogleDriveConnectionStatus> {
  const serviceAccount = getGoogleDriveServiceAccountConfig();
  const oauthConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
  const connection = await getStoredGoogleDriveConnection();
  const folderId = resolveGoogleDriveFolderId({
    envFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    metadata: connection?.metadata,
  });

  if (serviceAccount.configured) {
    if (!folderId) {
      return emptyStatus({
        configured: true,
        authMode: 'service_account',
        accountEmail: serviceAccount.clientEmail,
        accountName: 'Service Account',
        error: null,
      });
    }

    try {
      const accessToken = await getGoogleDriveServiceAccountAccessToken();
      const files = await listDriveFiles(accessToken, 8, folderId);
      return {
        configured: true,
        connected: true,
        authMode: 'service_account',
        accountEmail: serviceAccount.clientEmail,
        accountName: 'Service Account',
        folderId,
        fileCount: files.length,
        recentFiles: files,
        error: null,
      };
    } catch (error) {
      return emptyStatus({
        configured: true,
        authMode: 'service_account',
        accountEmail: serviceAccount.clientEmail,
        accountName: 'Service Account',
        folderId,
        error: error instanceof Error ? error.message : 'Unable to reach Google Drive with service account.',
      });
    }
  }

  if (!oauthConfigured) {
    return emptyStatus({
      error: 'Configure Google Drive service account or OAuth credentials in .env.local.',
    });
  }

  if (!connection?.accessToken) {
    return emptyStatus({
      configured: true,
      authMode: 'oauth',
    });
  }

  try {
    const files = await listDriveFiles(connection.accessToken, 8, folderId);
    return {
      configured: true,
      connected: true,
      authMode: 'oauth',
      accountEmail: (connection.metadata.email as string | undefined) ?? connection.accountName,
      accountName: connection.accountName,
      folderId,
      fileCount: files.length,
      recentFiles: files,
      error: null,
    };
  } catch (error) {
    return emptyStatus({
      configured: true,
      connected: true,
      authMode: 'oauth',
      accountEmail: connection.accountName,
      accountName: connection.accountName,
      folderId,
      error: error instanceof Error ? error.message : 'Unable to reach Google Drive API.',
    });
  }
}

export async function listDriveFiles(
  accessToken: string,
  pageSize = 10,
  folderId?: string | null
): Promise<GoogleDriveFileSummary[]> {
  const url = new URL(DRIVE_FILES_URL);
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('fields', 'files(id,name,mimeType,modifiedTime,webViewLink)');
  url.searchParams.set('orderBy', 'modifiedTime desc');

  const mimeFilter =
    "(mimeType = 'application/pdf' or mimeType contains 'document' or mimeType contains 'spreadsheet' or mimeType contains 'presentation' or mimeType = 'text/plain')";
  const folderFilter = folderId ? `'${folderId}' in parents and ` : '';
  url.searchParams.set('q', `${folderFilter}trashed = false and ${mimeFilter}`);
  url.searchParams.set('supportsAllDrives', 'true');
  url.searchParams.set('includeItemsFromAllDrives', 'true');

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = (await response.json()) as {
    files?: Array<{
      id?: string;
      name?: string;
      mimeType?: string;
      modifiedTime?: string;
      webViewLink?: string;
    }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Google Drive API error (${response.status}).`);
  }

  return (payload.files ?? [])
    .filter((file): file is { id: string; name: string; mimeType: string; modifiedTime?: string; webViewLink?: string } =>
      Boolean(file.id && file.name && file.mimeType)
    )
    .map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime ?? null,
      webViewLink: file.webViewLink ?? null,
    }));
}
