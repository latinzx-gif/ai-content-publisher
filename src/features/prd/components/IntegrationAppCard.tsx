'use client';

import { useState } from 'react';
import type { integrationApps } from '@/features/prd/config/settings-display';
import type {
  GoogleDriveFolderFormState,
  IntegrationAppLiveState,
  IntegrationOAuthSetupHint,
} from '@/features/prd/hooks/useIntegrationConnections';

export function IntegrationAppCard({
  app,
  live,
  setupHint,
  driveFolder,
  onAction,
  actionLoading = false,
}: {
  app: (typeof integrationApps)[number];
  live?: IntegrationAppLiveState;
  setupHint?: IntegrationOAuthSetupHint;
  driveFolder?: GoogleDriveFolderFormState;
  onAction: () => void;
  actionLoading?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = app.icon;
  const status = live?.status ?? app.status;
  const readiness = live?.readiness ?? app.readiness;
  const lastSync = live?.lastSync ?? app.lastSync;
  const connected = live?.connected ?? status === 'Connected';
  const ready = readiness === 'Ready';
  const actionLabel = live?.actionLabel ?? (connected ? 'Manage' : 'Connect');
  const disabled = live?.disabled ?? false;

  return (
    <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2] text-[#171717]">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#171717]">{app.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{app.description}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            ready ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          {readiness}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        <div className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Scope</div>
          <div className="mt-1 font-semibold text-[#4f4f49]">
            {app.category} · {app.scope}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Auth</div>
            <div className="mt-1 font-semibold text-[#4f4f49]">{app.auth}</div>
          </div>
          <div className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Last sync</div>
            <div className="mt-1 font-semibold text-[#4f4f49]">{lastSync}</div>
          </div>
        </div>
      </div>

      {setupHint ? (
        <div className="mt-4 rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2 text-xs leading-relaxed text-[#4f4f49]">
          <div className="font-semibold text-[#171717]">Setup required</div>
          <p className="mt-1">
            Add <span className="font-mono text-[11px]">{setupHint.envKeys.join(', ')}</span> to{' '}
            <span className="font-mono text-[11px]">.env.local</span>, then restart dev.
          </p>
          {setupHint.mode === 'service_account' && setupHint.serviceAccountEmail ? (
            <p className="mt-2">
              Share your Drive folder with{' '}
              <span className="font-mono text-[11px]">{setupHint.serviceAccountEmail}</span>
            </p>
          ) : (
            <>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Redirect URI</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <code className="break-all font-mono text-[11px]">{setupHint.callbackUrl}</code>
                <button
                  className="rounded border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]"
                  onClick={() => {
                    void navigator.clipboard.writeText(setupHint.callbackUrl);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                  type="button"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </>
          )}
          <a
            className="mt-2 inline-flex font-semibold text-[#2f4f7f] underline"
            href={setupHint.registerUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open Google Cloud Console
          </a>
        </div>
      ) : null}

      {driveFolder ? (
        <div className="mt-4 rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2 text-xs leading-relaxed text-[#4f4f49]">
          {driveFolder.serviceAccountEmail ? (
            <p>
              Share folder with{' '}
              <span className="font-mono text-[11px]">{driveFolder.serviceAccountEmail}</span>
            </p>
          ) : null}
          <label className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">
            Folder link
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs text-[#171717]"
            onChange={(event) => driveFolder.onFolderUrlChange(event.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            value={driveFolder.folderUrl}
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            connected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]'
          }`}
        >
          {status}
        </span>
        <button
          onClick={onAction}
          disabled={disabled || actionLoading}
          className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          {actionLoading ? 'Working…' : actionLabel}
        </button>
      </div>
    </div>
  );
}
