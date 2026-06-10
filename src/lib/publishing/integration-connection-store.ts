import { decryptSecret, encryptSecret } from '@/lib/server/tokenCipher';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type Provider = 'buffer' | 'facebook';

type StoredConnection = {
  accountId: string;
  accountName: string | null;
  externalAccountId: string | null;
  metadata: Record<string, unknown>;
  accessToken: string | null;
};

async function getIntegrationId(provider: Provider) {
  const db = createSupabaseServerClient();
  const { data, error } = await db
    .from('integrations')
    .select('id')
    .eq('provider', provider)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data?.id) {
    throw new Error(`Integration provider "${provider}" is not configured.`);
  }
  return data.id;
}

async function loadStoredConnection(provider: Provider): Promise<StoredConnection | null> {
  const db = createSupabaseServerClient();
  const integrationId = await getIntegrationId(provider);

  const { data: account, error: accountError } = await db
    .from('integration_accounts')
    .select('id, account_name, external_account_id, metadata, status')
    .eq('integration_id', integrationId)
    .eq('status', 'connected')
    .order('connected_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (accountError) {
    throw new Error(accountError.message);
  }
  if (!account) {
    return null;
  }

  const { data: tokenRow, error: tokenError } = await db
    .from('integration_tokens')
    .select('encrypted_token')
    .eq('integration_account_id', account.id)
    .eq('token_type', 'access_token')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tokenError) {
    throw new Error(tokenError.message);
  }

  return {
    accountId: account.id,
    accountName: account.account_name,
    externalAccountId: account.external_account_id,
    metadata: (account.metadata as Record<string, unknown> | null) ?? {},
    accessToken: tokenRow?.encrypted_token ? decryptSecret(tokenRow.encrypted_token) : null,
  };
}

export async function saveProviderAccessToken(input: {
  provider: Provider;
  accessToken: string;
  accountName?: string | null;
  externalAccountId?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const db = createSupabaseServerClient();
  const integrationId = await getIntegrationId(input.provider);
  const existing = await loadStoredConnection(input.provider);

  let accountId = existing?.accountId;
  if (!accountId) {
    const { data: created, error: createError } = await db
      .from('integration_accounts')
      .insert({
        integration_id: integrationId,
        account_name: input.accountName ?? null,
        external_account_id: input.externalAccountId ?? null,
        status: 'connected',
        metadata: input.metadata ?? {},
      })
      .select('id')
      .single();

    if (createError) {
      throw new Error(createError.message);
    }
    accountId = created.id;
  } else {
    const { error: updateError } = await db
      .from('integration_accounts')
      .update({
        account_name: input.accountName ?? existing?.accountName ?? null,
        external_account_id: input.externalAccountId ?? existing?.externalAccountId ?? null,
        status: 'connected',
        last_sync_at: new Date().toISOString(),
        metadata: {
          ...(existing?.metadata ?? {}),
          ...(input.metadata ?? {}),
        },
      })
      .eq('id', accountId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  const { error: tokenError } = await db.from('integration_tokens').insert({
    integration_account_id: accountId,
    token_type: 'access_token',
    encrypted_token: encryptSecret(input.accessToken),
    expires_at: input.expiresAt ?? null,
  });

  if (tokenError) {
    throw new Error(tokenError.message);
  }
}

export async function getStoredBufferAccessToken() {
  const envToken = process.env.BUFFER_ACCESS_TOKEN?.trim();
  if (envToken) {
    return envToken;
  }

  const stored = await loadStoredConnection('buffer');
  return stored?.accessToken ?? null;
}

export async function getStoredFacebookConnection() {
  return loadStoredConnection('facebook');
}

export async function disconnectProvider(provider: Provider) {
  const db = createSupabaseServerClient();
  const stored = await loadStoredConnection(provider);
  if (!stored) {
    return;
  }

  const { error } = await db
    .from('integration_accounts')
    .update({ status: 'disconnected' })
    .eq('id', stored.accountId);

  if (error) {
    throw new Error(error.message);
  }
}
