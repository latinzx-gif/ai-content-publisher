import { NextResponse } from 'next/server';
import { discoverAgentRuntimes, normalizeAgentRuntimePreference } from '@/lib/agents/runtimeDiscovery';
import { requireApiActor } from '@/lib/server/apiSecurity';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const { searchParams } = new URL(request.url);
    const preference = normalizeAgentRuntimePreference(searchParams.get('preference'));
    const selection = discoverAgentRuntimes(preference);

    return NextResponse.json({
      status: selection.selectedProvider ? 'ready' : 'unavailable',
      ...selection,
    });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'medium',
      status: 'open',
      message: error instanceof Error ? error.message : 'Runtime discovery failed',
      source: 'runtimes_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
