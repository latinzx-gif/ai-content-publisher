'use client';

import { IntegrationAppCard } from '@/features/prd/components/IntegrationAppCard';
import { integrationApps } from '@/features/prd/config/settings-display';
import { useIntegrationConnections } from '@/features/prd/hooks/useIntegrationConnections';

export function SettingsIntegrations() {
  const {
    loading,
    notice,
    error,
    actionLoading,
    wiredConnectedCount,
    setupInfo,
    googleDriveFolderForm,
    getAppLiveState,
    handleAppAction,
  } = useIntegrationConnections('/?page=settings');

  const knowledgeCount = integrationApps.filter((app) => app.category === 'Knowledge Source').length;
  const publishingCount = integrationApps.filter((app) => app.category === 'Publishing').length;

  function getSetupHint(provider: (typeof integrationApps)[number]['provider']) {
    if (provider === 'google_drive' && setupInfo && !setupInfo.google_drive.configured) {
      return {
        ...setupInfo.google_drive,
        mode: 'service_account' as const,
      };
    }
    if (provider === 'facebook' && setupInfo && !setupInfo.facebook.configured) {
      return setupInfo.facebook;
    }
    return undefined;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Integrations</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">
            Connect content sources, publishing platforms, and social channels. Facebook and Google Drive use the Connect buttons below.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button
            className="flex-1 rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] sm:flex-none"
            type="button"
            disabled
          >
            Add custom integration
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            {
              label: 'Connected',
              value: loading ? '…' : `${wiredConnectedCount}/2`,
              detail: 'Facebook and Google Drive',
            },
            { label: 'Knowledge sources', value: knowledgeCount, detail: 'RAG ingest candidates' },
            { label: 'Publishing targets', value: publishingCount, detail: 'Queue/post destinations' },
            { label: 'Health policy', value: 'Logged', detail: 'Every connect/disconnect becomes an audit event' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
            </div>
          ))}
        </div>
        {notice ? (
          <div className="mt-4 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs leading-relaxed text-[#2f4f7f]">
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-[#f2d4d4] bg-[#fdf4f4] px-3 py-2 text-xs leading-relaxed text-[#8f2f2f]">
            {error}
          </div>
        ) : null}
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {integrationApps.map((app) => (
          <IntegrationAppCard
            key={app.name}
            app={app}
            live={app.provider ? getAppLiveState(app.provider) ?? undefined : undefined}
            setupHint={getSetupHint(app.provider)}
            driveFolder={app.provider === 'google_drive' ? googleDriveFolderForm ?? undefined : undefined}
            actionLoading={app.provider ? actionLoading === app.provider : false}
            onAction={() => {
              void handleAppAction(app.provider, app.name);
            }}
          />
        ))}
      </div>
    </div>
  );
}
