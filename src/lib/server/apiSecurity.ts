import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { isServerApiAuthBypassEnabled } from '@/lib/auth-bypass';
import { isMissingSupabaseServerConfigError } from '@/lib/supabase/server';

const API_AUTH_BYPASS_ENABLED = isServerApiAuthBypassEnabled();

export type ApiActor = {
  authUserId: string;
  profileId: string;
  displayName: string;
};

export type TeamPermission =
  | 'can_create'
  | 'can_review'
  | 'can_approve'
  | 'can_publish'
  | 'can_manage_settings';

type TeamPermissionRow = {
  role: string;
} & Partial<Record<TeamPermission, boolean | null>>;

type RequireApiActorResult =
  | {
      actor: ApiActor;
      response: null;
    }
  | {
      actor: null;
      response: NextResponse;
    };

export async function requireApiActor(request: Request, supabase: SupabaseClient): Promise<RequireApiActorResult> {
  if (API_AUTH_BYPASS_ENABLED) {
    const actor = await getDevBypassActor(supabase);
    return {
      actor,
      response: null,
    };
  }

  const token = getBearerToken(request);

  if (!token) {
    return {
      actor: null,
      response: NextResponse.json({ error: 'Unauthorized', message: 'Bearer token is required.' }, { status: 401 }),
    };
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (isMissingSupabaseServerConfigError(error)) {
    return {
      actor: null,
      response: NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'Supabase server environment variables are required.',
        },
        { status: 503 },
      ),
    };
  }

  if (error || !data.user) {
    return {
      actor: null,
      response: NextResponse.json({ error: 'Unauthorized', message: 'Invalid or expired token.' }, { status: 401 }),
    };
  }

  const profile = await getOrCreateProfile(supabase, data.user);

  return {
    actor: {
      authUserId: data.user.id,
      profileId: profile.id,
      displayName: profile.display_name,
    },
    response: null,
  };
}

async function getDevBypassActor(supabase: SupabaseClient): Promise<ApiActor> {
  const configuredProfileId = process.env.AI_CONTENT_DEV_PROFILE_ID?.trim() || null;

  if (configuredProfileId) {
    const actor = await getActorFromProfileId(supabase, configuredProfileId);
    if (actor) {
      return actor;
    }
  }

  const { data: teamMembers, error: teamError } = await supabase
    .from('team_members')
    .select('profile_id, role, can_create, can_review')
    .eq('status', 'active')
    .limit(25);

  if (teamError) {
    throw new Error(teamError.message);
  }

  const preferredMember =
    (teamMembers ?? []).find((member) => member.role === 'admin' && member.can_create && member.can_review) ??
    (teamMembers ?? []).find((member) => member.can_create && member.can_review) ??
    teamMembers?.[0];

  if (!preferredMember?.profile_id) {
    throw new Error('AI_CONTENT_DISABLE_API_AUTH is enabled but no active team member is available for local bypass.');
  }

  const actor = await getActorFromProfileId(supabase, preferredMember.profile_id);

  if (!actor) {
    throw new Error(`AI_CONTENT_DISABLE_API_AUTH is enabled but profile ${preferredMember.profile_id} is missing.`);
  }

  return actor;
}

async function getActorFromProfileId(supabase: SupabaseClient, profileId: string): Promise<ApiActor | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, auth_user_id, display_name')
    .eq('id', profileId)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    return null;
  }

  return {
    authUserId: profile.auth_user_id ?? `local-bypass:${profile.id}`,
    profileId: profile.id,
    displayName: profile.display_name || 'Local bypass user',
  };
}

export async function requireTeamPermission(supabase: SupabaseClient, actor: ApiActor, permission: TeamPermission) {
  const { data, error } = await supabase
    .from('team_members')
    .select(`role, ${permission}`)
    .eq('profile_id', actor.profileId)
    .eq('status', 'active')
    .maybeSingle<TeamPermissionRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data[permission] !== true) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `Missing required permission: ${permission}`,
      },
      { status: 403 },
    );
  }

  return null;
}

function normalizePermissionText(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

export async function requireReviewQueueMoveAuthority(_supabase: SupabaseClient, actor: ApiActor) {
  const isAgentOrchestrator = normalizePermissionText(actor.displayName) === 'agent orchestrator';

  if (isAgentOrchestrator) {
    return null;
  }

  return NextResponse.json(
    {
      error: 'Forbidden',
      message: 'Only Agent Orchestrator can move items out of In Review.',
    },
    { status: 403 },
  );
}

export async function requireActiveTeamMember(supabase: SupabaseClient, actor: ApiActor) {
  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('profile_id', actor.profileId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Active team membership is required.',
      },
      { status: 403 },
    );
  }

  return null;
}

export async function requireKnowledgeSourceAccess(supabase: SupabaseClient, actor: ApiActor, knowledgeSourceId: string) {
  const { data, error } = await supabase
    .from('knowledge_sources')
    .select('id, uploaded_by')
    .eq('id', knowledgeSourceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
  }

  if (data.uploaded_by === actor.profileId) {
    return null;
  }

  return requireTeamPermission(supabase, actor, 'can_manage_settings');
}

export async function requireContentAccess(supabase: SupabaseClient, actor: ApiActor, contentItemId: string) {
  const { data, error } = await supabase
    .from('content_items')
    .select('id, created_by, assigned_to')
    .eq('id', contentItemId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
  }

  if (data.created_by === actor.profileId || data.assigned_to === actor.profileId) {
    return null;
  }

  return requireTeamPermission(supabase, actor, 'can_review');
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function getOrCreateProfile(supabase: SupabaseClient, user: User) {
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (existingProfile) {
    return existingProfile;
  }

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      auth_user_id: user.id,
      display_name: user.email ?? 'Workspace user',
    })
    .select('id, display_name')
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return createdProfile;
}
