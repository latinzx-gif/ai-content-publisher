'use client';

import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SettingsMenuIcon } from '@/features/prd/components/icons/prd-icons';
import { settingsGroups } from '@/features/prd/config/settings-display';
import type { AgentRuntimePreference } from '@/features/prd/types/runtime';
import { SettingsApiTokens } from '@/features/prd/views/settings/SettingsApiTokens';
import { SettingsCodexConnection } from '@/features/prd/views/settings/SettingsCodexConnection';
import { SettingsFacebookLogin } from '@/features/prd/views/settings/SettingsFacebookLogin';
import { SettingsIntegrations } from '@/features/prd/views/settings/SettingsIntegrations';
import { SettingsProfile } from '@/features/prd/views/settings/SettingsProfile';
import { SettingsReleaseReadiness } from '@/features/prd/views/settings/SettingsReleaseReadiness';

export function SettingsView({
  agentConnectionPreference,
  onAgentConnectionPreferenceChange,
}: {
  agentConnectionPreference: AgentRuntimePreference;
  onAgentConnectionPreferenceChange: (value: AgentRuntimePreference) => void;
}) {
  const [settingsPage, setSettingsPage] = useState('Integrations');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('integration') === 'buffer' || params.get('integration') === 'facebook') {
      setSettingsPage('Facebook');
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="grid lg:min-h-[720px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-[#deded8] bg-[#fbfbfa] p-3 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-2 lg:mb-6">
            <Settings className="h-4 w-4 text-[#171717]" />
            <h2 className="text-sm font-semibold text-[#171717]">Settings</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:block lg:space-y-6">
            {settingsGroups.map((group) => (
              <div key={group.label} className="min-w-0">
                <div className="mb-2 text-xs font-medium text-[#6e6e68]">{group.label}</div>
                <div className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
                  {group.items.map((item) => {
                    const active = item === settingsPage;

                    return (
                      <button
                        key={item}
                        onClick={() => setSettingsPage(item)}
                        className={`flex h-8 shrink-0 items-center justify-between gap-3 rounded-lg px-2 text-left text-sm lg:w-full ${
                          active ? 'bg-[#eeeeea] font-semibold text-[#171717]' : 'text-[#5f5f58] hover:bg-[#f6f6f2]'
                        }`}
                        type="button"
                      >
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <SettingsMenuIcon name={item} />
                          {item}
                        </span>
                        {active && <span className="hidden h-5 w-0.5 rounded-full bg-[#8b8b84] lg:block" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0 overflow-x-hidden p-4 md:p-8">
          {settingsPage === 'Integrations' ? (
            <SettingsIntegrations />
          ) : settingsPage === 'Facebook' ? (
            <SettingsFacebookLogin />
          ) : settingsPage === 'Codex Local' ? (
            <SettingsCodexConnection />
          ) : settingsPage === 'API Tokens' ? (
            <SettingsApiTokens
              providerPreference={agentConnectionPreference}
              onProviderPreferenceChange={onAgentConnectionPreferenceChange}
            />
          ) : settingsPage === 'Updates' ? (
            <SettingsReleaseReadiness />
          ) : (
            <SettingsProfile page={settingsPage} />
          )}
        </section>
      </div>
    </div>
  );
}
