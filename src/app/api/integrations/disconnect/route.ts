import { NextResponse } from 'next/server';
import { disconnectProvider } from '@/lib/publishing/integration-connection-store';
import { requireApiActor } from '@/lib/server/apiSecurity';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type DisconnectBody = {
  provider?: 'buffer' | 'facebook';
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { response } = await requireApiActor(request, supabase);
    if (response) {
      return response;
    }

    const body = (await request.json()) as DisconnectBody;
    if (body.provider !== 'buffer' && body.provider !== 'facebook') {
      return NextResponse.json({ error: 'provider must be buffer or facebook.' }, { status: 400 });
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
