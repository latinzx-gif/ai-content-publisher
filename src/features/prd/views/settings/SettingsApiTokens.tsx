'use client';

import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { KeyIcon } from '@/features/prd/components/icons/prd-icons';
import { Tag } from '@/features/prd/components/primitives/Tag';
import type { RuntimeDiscoveryResponse } from '@/features/prd/types/api';
import { providerKeyReadiness, settingsReadinessChecklist } from '@/features/prd/config/settings-display';
import type { AgentRuntimePreference } from '@/features/prd/types/runtime';

export function SettingsApiTokens({
  providerPreference,
  onProviderPreferenceChange,
}: {
  providerPreference: AgentRuntimePreference;
  onProviderPreferenceChange: (value: AgentRuntimePreference) => void;
}) {
  const [showTokenPreview, setShowTokenPreview] = useState(false);
  const [tokenActivity, setTokenActivity] = useState('Ready to test provider configuration against live runtime settings.');
  const [runtimeDiscovery, setRuntimeDiscovery] = useState<RuntimeDiscoveryResponse | null>(null);
  const [runtimeDiscoveryLoading, setRuntimeDiscoveryLoading] = useState(false);
  const configuredCount = providerKeyReadiness.filter((provider) => provider.status === 'Configured').length;
  const requiredCount = providerKeyReadiness.filter((provider) => provider.required).length;
  const configuredRequiredCount = providerKeyReadiness.filter((provider) => provider.required && provider.status === 'Configured').length;
  const readiness = configuredRequiredCount === requiredCount ? 'Required providers ready' : 'Required provider missing';
  const selectedModeLabel =
    providerPreference === 'auto'
      ? 'Auto-select the best available runtime'
      : providerPreference === 'multica'
        ? 'Prefer Multica daemon, fallback Codex/OpenAI'
        : providerPreference === 'codex'
        ? 'Prefer Codex first, fallback OpenAI'
        : 'Use OpenAI API key only';
  const handleProviderPreferenceChange = (value: AgentRuntimePreference) => {
    onProviderPreferenceChange(value);
    setTokenActivity(
      value === 'auto'
        ? 'Execution preference updated: detect available runtimes and select automatically.'
        : value === 'multica'
          ? 'Execution preference updated: try Multica daemon first, then fallback to Codex/OpenAI if needed.'
          : value === 'codex'
        ? 'Execution preference updated: try Codex first, then fallback to OpenAI if needed.'
        : 'Execution preference updated: use OpenAI API key only.',
    );
  };

  const handleProviderTest = async (provider: string) => {
    if (provider !== 'Agent runtimes') {
      setTokenActivity(`${provider} readiness test recorded. Backend will verify env availability and write system_logs in Stage 9.`);
      return;
    }

    setRuntimeDiscoveryLoading(true);
    setTokenActivity('Checking local runtime availability from backend...');
    try {
      const token = window.sessionStorage.getItem('prd_api_bearer_token') ?? '';
      const response = await fetch(`/api/runtimes?preference=${providerPreference}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = (await response.json()) as RuntimeDiscoveryResponse | { error?: string };

      if (!response.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error ?? 'Runtime discovery failed' : 'Runtime discovery failed');
      }

      const discovery = payload as RuntimeDiscoveryResponse;
      setRuntimeDiscovery(discovery);
      setTokenActivity(
        discovery.selectedProvider
          ? `Runtime selected: ${discovery.selectedProvider}. ${discovery.candidates.filter((candidate) => candidate.available).length}/${discovery.candidates.length} runtime(s) available.`
          : 'No runtime is available. Configure Codex bridge or OpenAI API key.',
      );
    } catch (error) {
      setTokenActivity(error instanceof Error ? error.message : 'Runtime discovery failed');
      setRuntimeDiscovery(null);
    } finally {
      setRuntimeDiscoveryLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">API Tokens & Provider Readiness</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">
            Central place for provider keys used by agents, RAG, publishing jobs, and deployment checks. Values stay masked in the UI.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {readiness}
        </span>
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#171717]">Agent execution connection mode</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">กำหนดลำดับการเชื่อมต่อสำหรับการรัน Agent ในทุกขั้นตอน</p>
          <div className="mt-3 grid gap-2 lg:grid-cols-4">
            <button
              onClick={() => handleProviderPreferenceChange('auto')}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                providerPreference === 'auto'
                  ? 'border-[#171717] bg-[#171717] text-white'
                  : 'border-[#deded8] bg-white text-[#171717] hover:border-[#171717]'
              }`}
              type="button"
            >
              <div className="font-semibold">Auto select runtime</div>
              <p className={`mt-1 text-xs ${providerPreference === 'auto' ? 'text-white' : 'text-[#6e6e68]'}`}>
                ตรวจ local machine/bridge ก่อน แล้วเลือก runtime ที่พร้อมใช้งานที่สุด
              </p>
            </button>
            <button
              onClick={() => handleProviderPreferenceChange('multica')}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                providerPreference === 'multica'
                  ? 'border-[#171717] bg-[#171717] text-white'
                  : 'border-[#deded8] bg-white text-[#171717] hover:border-[#171717]'
              }`}
              type="button"
            >
              <div className="font-semibold">Multica daemon first</div>
              <p className={`mt-1 text-xs ${providerPreference === 'multica' ? 'text-white' : 'text-[#6e6e68]'}`}>
                ใช้ local Multica daemon ก่อน แล้ว fallback ไป Codex/OpenAI เมื่อ bridge ยังไม่พร้อม
              </p>
            </button>
            <button
              onClick={() => handleProviderPreferenceChange('codex')}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                providerPreference === 'codex'
                  ? 'border-[#171717] bg-[#171717] text-white'
                  : 'border-[#deded8] bg-white text-[#171717] hover:border-[#171717]'
              }`}
              type="button"
            >
              <div className="font-semibold">Codex (default)</div>
              <p className={`mt-1 text-xs ${providerPreference === 'codex' ? 'text-white' : 'text-[#6e6e68]'}`}>
                เชื่อมต่อผ่าน local Codex ก่อน แล้ว fallback ไป OpenAI API เมื่อจำเป็น
              </p>
            </button>
            <button
              onClick={() => handleProviderPreferenceChange('openai')}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                providerPreference === 'openai'
                  ? 'border-[#4f4f49] bg-[#171717] text-white'
                  : 'border-[#deded8] bg-white text-[#171717] hover:border-[#4f4f49]'
              }`}
              type="button"
            >
              <div className="font-semibold">OpenAI API only</div>
              <p className={`mt-1 text-xs ${providerPreference === 'openai' ? 'text-white' : 'text-[#6e6e68]'}`}>
                ใช้ OPENAI_API_KEY เท่านั้นผ่าน /api/agents/execute
              </p>
            </button>
          </div>
          <div className="mt-3 rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2 text-xs text-[#6e6e68]">
            Current execution mode: <span className="font-semibold text-[#171717]">{selectedModeLabel}</span>
          </div>
          <div className="mt-3 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[#171717]">Runtime discovery</div>
                <p className="mt-0.5 text-xs text-[#6e6e68]">Backend checks Codex Local Bridge and OpenAI runtime, then selects the available machine/runtime.</p>
              </div>
              <button
                onClick={() => handleProviderTest('Agent runtimes')}
                className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]"
                type="button"
              >
                {runtimeDiscoveryLoading ? 'Checking...' : 'Check runtimes'}
              </button>
            </div>
            {runtimeDiscovery ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {runtimeDiscovery.candidates.map((candidate) => (
                  <div key={candidate.id} className={`rounded-lg border p-3 ${candidate.available ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#171717]">{candidate.label}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${candidate.available ? 'border-emerald-200 bg-white text-emerald-700' : 'border-amber-200 bg-white text-amber-800'}`}>
                        {candidate.available ? 'Available' : 'Missing'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#4f4f49]">{candidate.reason}</p>
                  </div>
                ))}
                <div className="rounded-lg border border-[#d9e0ef] bg-[#f4f7fd] p-3 text-xs font-semibold text-[#2f4f7f] md:col-span-2">
                  Selected runtime: {runtimeDiscovery.selectedProvider ?? 'None'}
                </div>
                <div className="rounded-lg border border-[#deded8] bg-white p-3 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-[#171717]">Local CLI scan</div>
                      <p className="mt-0.5 text-[11px] text-[#8a8a82]">
                        Scope: {runtimeDiscovery.scanScope}. Browser cannot scan a user Mac directly without a daemon/bridge.
                      </p>
                    </div>
                    <Tag>{runtimeDiscovery.localTools.filter((tool) => tool.available).length}/{runtimeDiscovery.localTools.length} detected</Tag>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-2">
                    {runtimeDiscovery.localTools.map((tool) => (
                      <div key={tool.id} className={`rounded-lg border p-2 ${tool.available ? 'border-emerald-200 bg-emerald-50' : 'border-[#e3e3dd] bg-[#fbfbfa]'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#171717]">{tool.label}</div>
                            <div className="mt-0.5 truncate text-[11px] text-[#6e6e68]">{tool.path ?? tool.reason}</div>
                          </div>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tool.available ? 'border-emerald-200 bg-white text-emerald-700' : 'border-[#deded8] bg-white text-[#8a8a82]'}`}>
                            {tool.available ? 'Detected' : 'Not found'}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tool.capabilities.slice(0, 3).map((capability) => (
                            <span key={capability} className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#6e6e68]">
                              {capability}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: 'Providers tracked', value: providerKeyReadiness.length, detail: 'OpenAI, Supabase, Buffer, Vercel' },
            { label: 'Configured', value: configuredCount, detail: 'Ready for live workflow handoff' },
            { label: 'Required ready', value: `${configuredRequiredCount}/${requiredCount}`, detail: 'Required before backend jobs run' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs leading-relaxed text-[#2f4f7f]">
          {tokenActivity}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Provider keys</h3>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Masked values only. Backend should store secrets in environment variables or Supabase vault, not browser state.</p>
          </div>
          <button
            onClick={() => setShowTokenPreview((current) => !current)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
            type="button"
          >
            {showTokenPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showTokenPreview ? 'Hide masked keys' : 'Show masked keys'}
          </button>
        </div>

        <div className="divide-y divide-[#e8e8e4]">
          {providerKeyReadiness.map((provider) => {
            const configured = provider.status === 'Configured';

            return (
              <div key={provider.keyName} className="grid gap-3 px-4 py-4 lg:grid-cols-[150px_minmax(0,1fr)_150px_120px] lg:items-center">
                <div>
                  <div className="text-sm font-semibold text-[#171717]">{provider.provider}</div>
                  <div className="mt-0.5 text-[11px] font-semibold text-[#8a8a82]">{provider.required ? 'Required' : 'Optional'}</div>
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-xs font-semibold text-[#4f4f49]">
                    {showTokenPreview ? `${provider.keyName}=••••••••••••${configured ? 'ready' : 'pending'}` : provider.keyName}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{provider.scope}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Tag>{provider.models}</Tag>
                    <Tag>{provider.status}</Tag>
                  </div>
                </div>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    configured ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
                  }`}
                >
                  {provider.status}
                </span>
                <button
                  onClick={() => handleProviderTest(provider.provider)}
                  className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
                  type="button"
                >
                  Test
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
        <h3 className="text-sm font-semibold text-[#171717]">Backend handoff requirements</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {settingsReadinessChecklist.map((item) => (
            <div key={item} className="rounded-xl border border-[#deded8] bg-white px-3 py-2 text-xs leading-relaxed text-[#4f4f49]">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

