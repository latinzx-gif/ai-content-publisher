import { NextResponse } from 'next/server';
import { assertOpenAIAgentConfig, normalizeOpenAIAgentProvider } from '@/lib/agents/openaiModels';
import { requireFeature } from '@/lib/entitlements/guards';
import { requireApiActor, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type CreateAgentBody = {
  name?: string;
  purpose?: string;
  provider?: string;
  model?: string;
  systemPrompt?: string;
  permissions?: string[];
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireTeamPermission(supabase, actor, 'can_manage_settings');

    if (forbidden) {
      return forbidden;
    }

    const body = (await request.json()) as CreateAgentBody;

    const customAgentLocked = await requireFeature('custom_agents');
    if (customAgentLocked) {
      return customAgentLocked;
    }

    if (body.model || body.provider) {
      const modelLocked = await requireFeature('model_selection');
      if (modelLocked) {
        return modelLocked;
      }
    }

    if (body.systemPrompt) {
      const promptLocked = await requireFeature('agent_prompt_editing');
      if (promptLocked) {
        return promptLocked;
      }
    }

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const provider = normalizeOpenAIAgentProvider(body.provider ?? 'openai');
    const model = body.model ?? 'gpt-5.4-mini';
    assertOpenAIAgentConfig(body.provider ?? provider, model);

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        name: body.name,
        purpose: body.purpose ?? null,
        provider,
        model,
        system_prompt: body.systemPrompt ?? null,
        status: 'online',
        created_by: actor.profileId,
      })
      .select()
      .single();

    if (agentError) {
      throw new Error(agentError.message);
    }

    if (body.permissions?.length) {
      const { error: permissionError } = await supabase.from('agent_permissions').insert(
        body.permissions.map((permission) => ({
          agent_id: agent.id,
          permission,
        })),
      );

      if (permissionError) {
        throw new Error(permissionError.message);
      }
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'agent.created',
      targetType: 'agent',
      targetId: agent.id,
      metadata: {
        name: body.name,
        provider,
        model,
      },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Create agent failed',
      source: 'agents_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
