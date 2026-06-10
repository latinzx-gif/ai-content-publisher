'use client';

import { useState } from 'react';
import { PlugIcon } from '@/features/prd/components/icons/prd-icons';
import { IntegrationAppCard } from '@/features/prd/components/IntegrationAppCard';
import { integrationApps } from '@/features/prd/config/settings-display';

export function SettingsIntegrations() {
  const [integrationNotice, setIntegrationNotice] = useState('Integration readiness matrix is prepared for Stage 9 backend wiring.');
  const connectedCount = integrationApps.filter((app) => app.status === 'Connected').length;
  const knowledgeCount = integrationApps.filter((app) => app.category === 'Knowledge Source').length;
  const publishingCount = integrationApps.filter((app) => app.category === 'Publishing').length;
  const handleTestAll = () => {
    setIntegrationNotice('Test all integrations recorded. Backend will check OAuth/token health and write logs in Stage 9.');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Integrations</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">Connect content sources, publishing platforms, and social channels with explicit readiness for RAG and publishing workflows.</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button onClick={handleTestAll} className="flex-1 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-white sm:flex-none" type="button">
            Test all
          </button>
          <button className="flex-1 rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] sm:flex-none" type="button">
            Add custom integration
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: 'Connected', value: `${connectedCount}/${integrationApps.length}`, detail: 'Ready for live workflows' },
            { label: 'Knowledge sources', value: knowledgeCount, detail: 'RAG ingest candidates' },
            { label: 'Publishing targets', value: publishingCount, detail: 'Queue/post destinations' },
            { label: 'Health policy', value: 'Logged', detail: 'Every connect/test action becomes an audit event' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs leading-relaxed text-[#2f4f7f]">
          {integrationNotice}
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {integrationApps.map((app) => (
          <IntegrationAppCard
            key={app.name}
            app={app}
            onAction={() => setIntegrationNotice(`${app.name} ${app.status === 'Connected' ? 'manage' : 'connect'} action recorded. Backend connector will persist OAuth status in Stage 9.`)}
          />
        ))}
      </div>
    </div>
  );
}

