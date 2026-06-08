import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const missingConfigMessage = 'Missing server Supabase configuration';

export function createSupabaseServerClient() {
  if (!supabaseUrl) {
    return createMissingConfigClient('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!serviceRoleKey) {
    return createMissingConfigClient('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function createMissingConfigClient(detail: string): SupabaseClient {
  const error = {
    message: `${missingConfigMessage}: ${detail}`,
  };
  const result = {
    data: null,
    error,
  };

  return {
    auth: {
      getUser: async () => ({
        data: { user: null },
        error,
      }),
    },
    from: () => ({
      insert: async () => result,
      select: () => createQueryStub(result),
      update: () => createQueryStub(result),
      upsert: () => createQueryStub(result),
      delete: () => createQueryStub(result),
    }),
    rpc: async () => result,
  } as unknown as SupabaseClient;
}

function createQueryStub(result: { data: null; error: { message: string } }) {
  const query = {
    eq: () => query,
    in: () => query,
    order: () => query,
    limit: () => query,
    single: async () => result,
    maybeSingle: async () => result,
    select: () => query,
    insert: async () => result,
    update: () => query,
  };

  return query;
}

export function isMissingSupabaseServerConfigError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : null;

  return message?.startsWith(missingConfigMessage) ?? false;
}
