'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildOAuthCallbackUrl,
  OAUTH_PROVIDER_SETUP,
  type OAuthProviderKey,
} from '@/lib/publishing/oauth-setup-links';
import type { PublishingConnectionsStatus } from '@/lib/publishing/publishing-connection-status';

const API_TOKEN_STORAGE_KEY = 'prd_api_bearer_token';

type PublishingLoginPanelProps = {
  initialStatus: PublishingConnectionsStatus;
  returnTo: string;
  mode: 'prd' | 'publisher';
  onDisconnect?: (provider: 'buffer' | 'facebook') => Promise<void>;
};

type SetupInfo = {
  siteUrl: string;
  buffer: {
    configured: boolean;
    callbackUrl: string;
    registerUrl: string;
    docsUrl: string;
    envKeys: readonly string[];
    setupSteps: readonly string[];
  };
  facebook: {
    configured: boolean;
    callbackUrl: string;
    registerUrl: string;
    docsUrl: string;
    envKeys: readonly string[];
    setupSteps: readonly string[];
  };
};

function getBearerToken() {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.sessionStorage.getItem(API_TOKEN_STORAGE_KEY) ?? '';
}

export function PublishingLoginPanel({
  initialStatus,
  returnTo,
  mode,
  onDisconnect,
}: PublishingLoginPanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [setup, setSetup] = useState<SetupInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const bufferAuthorizeUrl = useMemo(
    () => `/api/integrations/buffer/authorize?returnTo=${encodeURIComponent(returnTo)}`,
    [returnTo]
  );
  const facebookAuthorizeUrl = useMemo(
    () => `/api/integrations/facebook/authorize?returnTo=${encodeURIComponent(returnTo)}`,
    [returnTo]
  );

  useEffect(() => {
    fetch('/api/integrations/setup')
      .then((response) => response.json())
      .then((payload: SetupInfo) => setSetup(payload))
      .catch(() => {
        const origin = window.location.origin;
        setSetup({
          siteUrl: origin,
          buffer: {
            configured: status.bufferOAuthConfigured,
            callbackUrl: buildOAuthCallbackUrl(origin, 'buffer'),
            registerUrl: OAUTH_PROVIDER_SETUP.buffer.registerUrl,
            docsUrl: OAUTH_PROVIDER_SETUP.buffer.docsUrl,
            envKeys: OAUTH_PROVIDER_SETUP.buffer.envKeys,
            setupSteps: OAUTH_PROVIDER_SETUP.buffer.setupSteps,
          },
          facebook: {
            configured: status.facebookOAuthConfigured,
            callbackUrl: buildOAuthCallbackUrl(origin, 'facebook'),
            registerUrl: OAUTH_PROVIDER_SETUP.facebook.registerUrl,
            docsUrl: OAUTH_PROVIDER_SETUP.facebook.docsUrl,
            envKeys: OAUTH_PROVIDER_SETUP.facebook.envKeys,
            setupSteps: OAUTH_PROVIDER_SETUP.facebook.setupSteps,
          },
        });
      });
  }, [status.bufferOAuthConfigured, status.facebookOAuthConfigured]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (mode === 'publisher') {
        const { loadPublishingConnectionStatus } = await import('@/app/publisher/settings/actions');
        const nextStatus = await loadPublishingConnectionStatus();
        setStatus(nextStatus);
        return;
      }

      const token = getBearerToken();
      const response = await fetch('/api/settings/facebook/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = (await response.json()) as PublishingConnectionsStatus & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to refresh publishing connection status.');
      }
      setStatus(payload);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Unable to refresh status.');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const integration = params.get('integration');
    const integrationStatus = params.get('integration_status');
    const integrationMessage = params.get('integration_message');

    if (!integration || !integrationStatus) {
      return;
    }

    if (integrationStatus === 'connected') {
      setMessage(`${integration === 'buffer' ? 'Buffer' : 'Facebook'} connected successfully.`);
    } else {
      setError(integrationMessage ?? `${integration} login failed.`);
    }

    params.delete('integration');
    params.delete('integration_status');
    params.delete('integration_message');
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', nextUrl);
    void refresh();
  }, [refresh]);

  async function handleDisconnect(provider: 'buffer' | 'facebook') {
    setError(null);
    setMessage(null);
    try {
      if (onDisconnect) {
        await onDisconnect(provider);
      } else {
        const token = getBearerToken();
        const response = await fetch('/api/integrations/disconnect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ provider }),
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? 'Disconnect failed.');
        }
      }
      setMessage(`${provider === 'buffer' ? 'Buffer' : 'Facebook'} disconnected.`);
      await refresh();
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : 'Disconnect failed.');
    }
  }

  async function copyText(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setError('Unable to copy to clipboard.');
    }
  }

  function handleLoginAttempt(provider: OAuthProviderKey, configured: boolean, loginHref: string) {
    if (!configured) {
      setError(
        `${OAUTH_PROVIDER_SETUP[provider].label} OAuth is not configured on the server yet. Use Register OAuth App, add env keys, then restart npm run dev.`
      );
      return;
    }
    window.location.assign(loginHref);
  }

  const bufferSetup = setup?.buffer;
  const facebookSetup = setup?.facebook;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#d9e0ef] bg-[#f4f7fd] px-4 py-3 text-sm leading-relaxed text-[#2f4f7f]">
        ถ้ากด Login แล้วไม่มีอะไรเกิดขึ้น แปลว่ายังไม่ได้ตั้ง OAuth บน server — ใช้ปุ่ม{' '}
        <strong>Register OAuth App</strong> ด้านล่างก่อน แล้วใส่ Client ID/Secret ใน{' '}
        <code className="rounded bg-white/70 px-1 py-0.5 text-xs">.env.local</code>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ConnectionCard
          provider="buffer"
          title="Buffer Login"
          description="Sign in with Buffer to publish and schedule posts from this app."
          connected={status.bufferConnected}
          configured={status.bufferOAuthConfigured}
          detail={
            status.bufferConnected
              ? 'Buffer account connected.'
              : status.bufferConfigured
                ? 'Buffer token found, but profile check failed.'
                : 'Not connected yet.'
          }
          setup={bufferSetup}
          loginHref={bufferAuthorizeUrl}
          copiedKey={copiedKey}
          onCopy={copyText}
          onLogin={() =>
            handleLoginAttempt('buffer', status.bufferOAuthConfigured, bufferAuthorizeUrl)
          }
          onRefresh={() => void refresh()}
          onDisconnect={() => void handleDisconnect('buffer')}
          refreshLabel={loading ? 'Checking…' : 'Check Buffer'}
        />

        <ConnectionCard
          provider="facebook"
          title="Facebook Login"
          description="Sign in with Facebook and approve Page access for scheduled publishing."
          connected={status.facebookConnected}
          configured={status.facebookOAuthConfigured}
          detail={
            status.facebookConnected
              ? `Connected Page: ${status.facebookPageName ?? status.facebookPageId ?? 'Facebook Page'}`
              : status.ready
                ? 'Facebook Page is available in Buffer.'
                : 'Connect Facebook to approve the Page used for publishing.'
          }
          setup={facebookSetup}
          loginHref={facebookAuthorizeUrl}
          copiedKey={copiedKey}
          onCopy={copyText}
          onLogin={() =>
            handleLoginAttempt('facebook', status.facebookOAuthConfigured, facebookAuthorizeUrl)
          }
          onRefresh={() => void refresh()}
          onDisconnect={() => void handleDisconnect('facebook')}
          refreshLabel={loading ? 'Checking…' : 'Check Facebook'}
        />
      </div>

      {status.facebookProfiles.length ? (
        <div className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
          <h3 className="text-sm font-semibold text-[#171717]">Buffer Facebook profiles</h3>
          <div className="mt-3 space-y-2">
            {status.facebookProfiles.map((profile) => (
              <div key={profile.id} className="rounded-xl border border-[#e8e8e4] bg-white px-3 py-2 text-sm">
                <p className="font-semibold text-[#171717]">
                  {profile.formattedUsername ?? profile.serviceUsername ?? 'Facebook Page'}
                </p>
                <p className="text-xs text-[#6e6e68]">Profile ID: {profile.id}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-xl border border-[#cde8d8] bg-[#f3fbf7] px-3 py-2 text-sm font-semibold text-[#1f6b45]">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-[#f0d4d4] bg-[#fff5f5] px-3 py-2 text-sm font-semibold text-[#8f2f2f]">
          {error}
        </p>
      ) : null}

      {status.bufferError ? (
        <p className="rounded-xl border border-[#f2e3b8] bg-[#fffaf0] px-3 py-2 text-sm text-[#7a5a12]">
          {status.bufferError}
        </p>
      ) : null}
    </div>
  );
}

function ConnectionCard({
  provider,
  title,
  description,
  connected,
  configured,
  detail,
  setup,
  copiedKey,
  onCopy,
  onLogin,
  onRefresh,
  onDisconnect,
  refreshLabel,
}: {
  provider: OAuthProviderKey;
  title: string;
  description: string;
  connected: boolean;
  configured: boolean;
  detail: string;
  setup?: SetupInfo['buffer'];
  loginHref: string;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
  onLogin: () => void;
  onRefresh: () => void;
  onDisconnect: () => void;
  refreshLabel: string;
}) {
  const copyKey = `${provider}-callback`;

  return (
    <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#171717]">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#6e6e68]">{description}</p>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            connected
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : configured
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]'
          }`}
        >
          {connected ? 'Connected' : configured ? 'Ready to login' : 'Setup required'}
        </span>
      </div>

      <p className="mt-3 text-sm text-[#4f4f49]">{detail}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={setup?.registerUrl ?? OAUTH_PROVIDER_SETUP[provider].registerUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-[#1877f2] bg-[#1877f2] px-3 py-2 text-xs font-semibold text-white hover:bg-[#166fe0]"
        >
          Register OAuth App
        </a>
        <a
          href={setup?.docsUrl ?? OAUTH_PROVIDER_SETUP[provider].docsUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
        >
          API docs
        </a>
        <button
          type="button"
          onClick={onLogin}
          className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
            configured ? 'bg-[#171717] hover:bg-[#2b2b28]' : 'bg-[#b8b8b2] hover:bg-[#a3a39d]'
          }`}
        >
          {connected ? 'Reconnect' : 'Login'}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
        >
          {refreshLabel}
        </button>
        {connected ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="rounded-lg border border-[#f0d4d4] bg-[#fff5f5] px-3 py-2 text-xs font-semibold text-[#8f2f2f] hover:bg-white"
          >
            Disconnect
          </button>
        ) : null}
      </div>

      {setup ? (
        <div className="mt-4 space-y-3 rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">
              Redirect URI (paste in OAuth app)
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="break-all rounded bg-white px-2 py-1 text-xs text-[#171717]">
                {setup.callbackUrl}
              </code>
              <button
                type="button"
                onClick={() => onCopy(copyKey, setup.callbackUrl)}
                className="rounded border border-[#deded8] bg-white px-2 py-1 text-[10px] font-semibold text-[#4f4f49]"
              >
                {copiedKey === copyKey ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">
              Env keys (.env.local)
            </p>
            <p className="mt-1 text-xs text-[#4f4f49]">{setup.envKeys.join(', ')}</p>
          </div>

          <ol className="space-y-1 text-xs leading-relaxed text-[#6e6e68]">
            {setup.setupSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {!configured ? (
        <p className="mt-3 text-xs font-semibold text-[#8a5a12]">
          Login will work after env keys are set and dev server is restarted.
        </p>
      ) : (
        <p className="mt-3 text-xs text-[#6e6e68]">
          OAuth is configured. Click Login to continue to {OAUTH_PROVIDER_SETUP[provider].label}.
        </p>
      )}
    </div>
  );
}
