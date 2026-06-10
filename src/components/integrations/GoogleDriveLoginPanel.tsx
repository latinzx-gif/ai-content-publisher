'use client';

import { useCallback, useEffect, useMemo, startTransition, useState } from 'react';
import {
  buildOAuthCallbackUrl,
  OAUTH_PROVIDER_SETUP,
} from '@/lib/publishing/oauth-setup-links';
import { consumeIntegrationCallbackFlash } from '@/lib/publishing/integration-callback-flash';
import type { GoogleDriveConnectionStatus } from '@/lib/integrations/google-drive-client';

const API_TOKEN_STORAGE_KEY = 'prd_api_bearer_token';

function getBearerToken() {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.sessionStorage.getItem(API_TOKEN_STORAGE_KEY) ?? '';
}

export function GoogleDriveLoginPanel({
  returnTo,
}: {
  returnTo: string;
}) {
  const [status, setStatus] = useState<GoogleDriveConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const authorizeUrl = useMemo(
    () => `/api/integrations/google-drive/authorize?returnTo=${encodeURIComponent(returnTo)}`,
    [returnTo]
  );

  const callbackUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return buildOAuthCallbackUrl(window.location.origin, 'google_drive');
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getBearerToken();
      const response = await fetch('/api/integrations/google-drive/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = (await response.json()) as GoogleDriveConnectionStatus & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load Google Drive status.');
      }
      setStatus(payload);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Unable to load Google Drive status.');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      const flash = consumeIntegrationCallbackFlash(['google_drive']);
      if (flash.message) {
        setMessage(flash.message);
      }
      if (flash.error) {
        setError(flash.error);
      }
      void refresh();
    });
  }, [refresh]);

  async function handleDisconnect() {
    const token = getBearerToken();
    const response = await fetch('/api/integrations/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ provider: 'google_drive' }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? 'Disconnect failed.');
      return;
    }
    setMessage('Google Drive disconnected.');
    await refresh();
  }

  function handleLogin() {
    if (!status?.configured) {
      setError('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local, then restart npm run dev.');
      return;
    }
    window.location.assign(authorizeUrl);
  }

  async function copyCallbackUrl() {
    if (!callbackUrl) return;
    await navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const setup = OAUTH_PROVIDER_SETUP.google_drive;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Google Drive Login</h3>
            <p className="mt-1 text-sm text-[#6e6e68]">
              Connect Drive so RAG and source search can read approved Docs, Sheets, PDFs, and Slides.
            </p>
          </div>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              status?.connected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]'
            }`}
          >
            {status?.connected ? 'Connected' : 'Not connected'}
          </span>
        </div>

        {status?.connected ? (
          <p className="mt-3 text-sm text-[#4f4f49]">
            Account: <strong>{status.accountName ?? status.accountEmail ?? 'Google account'}</strong>
            {status.fileCount ? ` · ${status.fileCount} recent file(s) visible` : ''}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[#4f4f49]">
            {status?.configured
              ? 'OAuth is configured. Click Login to approve Drive read access.'
              : 'Register OAuth app and add Google credentials before login.'}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={setup.registerUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[#1a73e8] bg-[#1a73e8] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1669d3]"
          >
            Register OAuth App
          </a>
          <button
            type="button"
            onClick={handleLogin}
            className="rounded-lg bg-[#171717] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2b2b28]"
          >
            {status?.connected ? 'Reconnect' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49]"
          >
            {loading ? 'Checking…' : 'Check connection'}
          </button>
          {status?.connected ? (
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              className="rounded-lg border border-[#f0d4d4] bg-[#fff5f5] px-3 py-2 text-xs font-semibold text-[#8f2f2f]"
            >
              Disconnect
            </button>
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3 text-xs text-[#6e6e68]">
          <p className="font-semibold text-[#4f4f49]">Redirect URI</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="break-all rounded bg-white px-2 py-1 text-[#171717]">{callbackUrl}</code>
            <button type="button" onClick={() => void copyCallbackUrl()} className="rounded border border-[#deded8] bg-white px-2 py-1 font-semibold">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-2">Env: {setup.envKeys.join(', ')}</p>
        </div>
      </div>

      {status?.recentFiles.length ? (
        <div className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
          <h4 className="text-sm font-semibold text-[#171717]">Recent Drive files</h4>
          <div className="mt-3 space-y-2">
            {status.recentFiles.map((file) => (
              <div key={file.id} className="rounded-xl border border-[#e8e8e4] bg-white px-3 py-2 text-sm">
                <p className="font-semibold text-[#171717]">{file.name}</p>
                <p className="text-xs text-[#6e6e68]">{file.mimeType}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {message ? <p className="rounded-xl border border-[#cde8d8] bg-[#f3fbf7] px-3 py-2 text-sm font-semibold text-[#1f6b45]">{message}</p> : null}
      {error || status?.error ? (
        <p className="rounded-xl border border-[#f0d4d4] bg-[#fff5f5] px-3 py-2 text-sm font-semibold text-[#8f2f2f]">
          {error ?? status?.error}
        </p>
      ) : null}
    </div>
  );
}
