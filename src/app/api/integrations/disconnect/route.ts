import { NextResponse } from 'next/server';
import { disconnectProvider } from '@/lib/integrations/integration-connection-store';
import { requireApiActor } from '@/lib/server/apiSecurity';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type DisconnectBody = {
  provider?: 'buffer' | 'facebook' | 'google_drive';
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { response } = await requireApiActor(request, supabase);
    if (response) {
      return response;
    }

    const body = (await request.json()) as DisconnectBody;
    if (body.provider !== 'buffer' && body.provider !== 'facebook' && body.provider !== 'google_drive') {
      return NextResponse.json({ error: 'provider must be buffer, facebook, or google_drive.' }, { status: 400 });
    }

    await disconnectProvider(body.provider);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to disconnect integration.' },
      { status: 500 }
    );
  }
}
