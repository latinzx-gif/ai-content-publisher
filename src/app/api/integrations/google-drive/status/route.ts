import { NextResponse } from 'next/server';
import { getGoogleDriveConnectionStatus } from '@/lib/integrations/google-drive-client';
import { requireApiActor } from '@/lib/server/apiSecurity';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { response } = await requireApiActor(request, supabase);
    if (response) {
      return response;
    }

    const status = await getGoogleDriveConnectionStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load Google Drive status.' },
      { status: 500 }
    );
  }
}
