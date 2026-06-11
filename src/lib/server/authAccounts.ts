import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

type AuthAccountClient = SupabaseClient;

export type AuthAccountSession = {
  accessToken: string;
  expiresAt: number | null;
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    displayName: string;
  };
  teamMember: {
    role: string;
    canCreate: boolean;
    canReview: boolean;
    canApprove: boolean;
    canPublish: boolean;
    canManageSettings: boolean;
  };
};

type TeamMemberRow = {
  role: string;
  can_create: boolean | null;
  can_review: boolean | null;
  can_approve: boolean | null;
  can_publish: boolean | null;
  can_manage_settings: boolean | null;
};

export function createAuthAccountClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function normalizeAuthEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function normalizeAuthPassword(password: unknown) {
  return typeof password === 'string' ? password.trim() : '';
}

export function defaultDisplayName(email: string) {
  return email.split('@')[0] || email;
}

export async function findAuthUserByEmail(supabase: AuthAccountClient, email: string) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }

    page += 1;
  }

  throw new Error('Unable to find user after scanning 2000 auth users.');
}

export async function ensureAuthProfile(supabase: AuthAccountClient, user: User, displayName?: string) {
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (existingProfile) {
    return {
      id: existingProfile.id as string,
      displayName: (existingProfile.display_name as string) || displayName || user.email || 'Workspace user',
    };
  }

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      auth_user_id: user.id,
      display_name: displayName || user.email || 'Workspace user',
    })
    .select('id, display_name')
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return {
    id: createdProfile.id as string,
    displayName: (createdProfile.display_name as string) || displayName || user.email || 'Workspace user',
  };
}

export async function ensureStarterTeamMember(supabase: AuthAccountClient, profileId: string) {
  const { data: existingMember, error: existingError } = await supabase
    .from('team_members')
    .select('role, can_create, can_review, can_approve, can_publish, can_manage_settings')
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .maybeSingle<TeamMemberRow>();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingMember) {
    return normalizeTeamMember(existingMember);
  }

  const shouldCreateFirstAdmin = !(await hasActiveAdmin(supabase));
  const starterMember = shouldCreateFirstAdmin
    ? {
        role: 'admin',
        can_create: true,
        can_review: true,
        can_approve: true,
        can_publish: true,
        can_manage_settings: true,
      }
    : {
        role: 'editor',
        can_create: true,
        can_review: false,
        can_approve: false,
        can_publish: false,
        can_manage_settings: false,
      };

  const { data: createdMember, error: createError } = await supabase
    .from('team_members')
    .insert({
      profile_id: profileId,
      status: 'active',
      ...starterMember,
    })
    .select('role, can_create, can_review, can_approve, can_publish, can_manage_settings')
    .single<TeamMemberRow>();

  if (createError) {
    throw new Error(createError.message);
  }

  return normalizeTeamMember(createdMember);
}

export function oauthDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};
  const candidates = [metadata.full_name, metadata.name, metadata.display_name];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (user.email) {
    return defaultDisplayName(user.email);
  }

  return 'Workspace user';
}

/** Create profiles + team_members for first-time Publisher OAuth / magic-link users. */
export async function provisionWorkspaceUser(user: User) {
  const supabase = createAuthAccountClient();
  const profile = await ensureAuthProfile(supabase, user, oauthDisplayName(user));
  await ensureStarterTeamMember(supabase, profile.id);
  return profile;
}

export async function createSessionResponse(supabase: AuthAccountClient, email: string, password: string, displayName?: string): Promise<AuthAccountSession> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user || !data.session?.access_token) {
    throw new Error(error?.message || 'Sign in failed.');
  }

  const profile = await ensureAuthProfile(supabase, data.user, displayName || defaultDisplayName(email));
  const teamMember = await ensureStarterTeamMember(supabase, profile.id);

  return {
    accessToken: data.session.access_token,
    expiresAt: data.session.expires_at ?? null,
    user: {
      id: data.user.id,
      email,
    },
    profile,
    teamMember,
  };
}

async function hasActiveAdmin(supabase: AuthAccountClient) {
  const { data, error } = await supabase.from('team_members').select('id').eq('role', 'admin').eq('status', 'active').limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.length);
}

function normalizeTeamMember(row: TeamMemberRow) {
  return {
    role: row.role,
    canCreate: row.can_create === true,
    canReview: row.can_review === true,
    canApprove: row.can_approve === true,
    canPublish: row.can_publish === true,
    canManageSettings: row.can_manage_settings === true,
  };
}
