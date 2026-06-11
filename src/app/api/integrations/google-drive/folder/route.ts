import { NextResponse } from 'next/server';
import { saveGoogleDriveFolderLink } from '@/lib/integrations/integration-connection-store';
import {
  getGoogleDriveServiceAccountAccessToken,
  getGoogleDriveServiceAccountConfig,
  parseGoogleDriveFolderId,
} from '@/lib/integrations/google-drive-service-account';
import { listDriveFiles } from '@/lib/integrations/google-drive-client';
import { requireApiActor } from '@/lib/server/apiSecurity';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type FolderBody = {
  folderUrl?: string;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { response } = await requireApiActor(request, supabase);
    if (response) {
      return response;
    }

    const serviceAccount = getGoogleDriveServiceAccountConfig();
    if (!serviceAccount.configured || !serviceAccount.clientEmail) {
      return NextResponse.json(
        {
          error:
            'Set GOOGLE_SERVICE_ACCOUNT_JSON (or EMAIL + PRIVATE_KEY) in .env.local, then restart npm run dev.',
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as FolderBody;
    const folderId = parseGoogleDriveFolderId(body.folderUrl ?? '');
    if (!folderId) {
      return NextResponse.json({ error: 'Paste a valid Google Drive folder link or folder ID.' }, { status: 400 });
    }

    const accessToken = await getGoogleDriveServiceAccountAccessToken();
    const files = await listDriveFiles(accessToken, 3, folderId);

    await saveGoogleDriveFolderLink({
      folderId,
      folderUrl: body.folderUrl?.trim() || null,
      accountEmail: serviceAccount.clientEmail,
    });

    return NextResponse.json({
      ok: true,
      folderId,
      fileCount: files.length,
      recentFiles: files,
      serviceAccountEmail: serviceAccount.clientEmail,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to save Google Drive folder. Share the folder with the service account email first.',
      },
      { status: 500 }
    );
  }
}
