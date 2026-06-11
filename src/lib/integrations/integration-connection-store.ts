import { decryptSecret, encryptSecret } from '@/lib/server/tokenCipher';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type IntegrationProvider = 'buffer' | 'facebook' | 'google_drive';

type StoredConnection = {
  accountId: string;
  accountName: string | null;
  externalAccountId: string | null;
  metadata: Record<string, unknown>;
  accessToken: string | null;
  refreshToken: string | null;
};

async function getIntegrationId(provider: IntegrationProvider) {
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

async function loadLatestToken(integrationAccountId: string, tokenType: 'access_token' | 'refresh_token') {
  const db = createSupabaseServerClient();
  const { data, error } = await db
    .from('integration_tokens')
    .select('encrypted_token')
    .eq('integration_account_id', integrationAccountId)
    .eq('token_type', tokenType)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.encrypted_token ? decryptSecret(data.encrypted_token) : null;
}

async function loadStoredConnection(provider: IntegrationProvider): Promise<StoredConnection | null> {
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

  const [accessToken, refreshToken] = await Promise.all([
    loadLatestToken(account.id, 'access_token'),
    loadLatestToken(account.id, 'refresh_token'),
  ]);

  return {
    accountId: account.id,
    accountName: account.account_name,
    externalAccountId: account.external_account_id,
    metadata: (account.metadata as Record<string, unknown> | null) ?? {},
    accessToken,
    refreshToken,
  };
}

export async function saveProviderAccessToken(input: {
  provider: IntegrationProvider;
  accessToken: string;
  refreshToken?: string | null;
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

  const { error: accessTokenError } = await db.from('integration_tokens').insert({
    integration_account_id: accountId,
    token_type: 'access_token',
    encrypted_token: encryptSecret(input.accessToken),
    expires_at: input.expiresAt ?? null,
  });

  if (accessTokenError) {
    throw new Error(accessTokenError.message);
  }

  if (input.refreshToken) {
    const { error: refreshTokenError } = await db.from('integration_tokens').insert({
      integration_account_id: accountId,
      token_type: 'refresh_token',
      encrypted_token: encryptSecret(input.refreshToken),
      expires_at: null,
    });

    if (refreshTokenError) {
      throw new Error(refreshTokenError.message);
    }
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

export async function getStoredGoogleDriveConnection() {
  return loadStoredConnection('google_drive');
}

export async function saveGoogleDriveFolderLink(input: {
  folderId: string;
  folderUrl?: string | null;
  accountEmail: string;
}) {
  const db = createSupabaseServerClient();
  const integrationId = await getIntegrationId('google_drive');
  const existing = await loadStoredConnection('google_drive');

  const metadata = {
    ...(existing?.metadata ?? {}),
    authMode: 'service_account',
    folderId: input.folderId,
    folderUrl: input.folderUrl ?? null,
  };

  if (!existing?.accountId) {
    const { error: createError } = await db.from('integration_accounts').insert({
      integration_id: integrationId,
      account_name: 'Service Account',
      external_account_id: input.accountEmail,
      status: 'connected',
      metadata,
      connected_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
    });

    if (createError) {
      throw new Error(createError.message);
    }
    return;
  }

  const { error: updateError } = await db
    .from('integration_accounts')
    .update({
      account_name: 'Service Account',
      external_account_id: input.accountEmail,
      status: 'connected',
      metadata,
      last_sync_at: new Date().toISOString(),
    })
    .eq('id', existing.accountId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export async function disconnectProvider(provider: IntegrationProvider) {
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
