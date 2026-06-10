'use client';

import { Layers3, ShieldCheck } from 'lucide-react';
import { Tag } from '@/features/prd/components/primitives/Tag';
import { BackendImplementationHandoff } from '@/features/prd/views/settings/BackendImplementationHandoff';
import {
  backendApiContracts,
  backendDatabaseTables,
  backendEnvContracts,
  backendJobQueues,
  backendSecurityChecklist,
} from '@/features/prd/config/settings-display';

export function BackendReadinessMap() {
  const requiredTables = backendDatabaseTables.filter((item) => item.status === 'Required').length;
  const requiredApis = backendApiContracts.filter((item) => item.status === 'Required').length;
  const serverOnlyEnv = backendEnvContracts.filter((item) => item.visibility === 'Server only').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Backend readiness map</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#6e6e68]">
            Stage 9 defines the backend contract before wiring real Supabase tables, OpenAI agent jobs, publishing workers, and append-only logs.
          </p>
        </div>
        <span className="rounded-full border border-[#cfd8ea] bg-[#f4f7fd] px-3 py-1 text-xs font-semibold text-[#2f4f7f]">
          Ready for implementation planning
        </span>
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: 'Supabase tables', value: requiredTables, detail: 'Workflow, review, queue, logs, RAG, assets' },
            { label: 'API contracts', value: requiredApis, detail: 'Next.js route handlers before real mutations' },
            { label: 'Worker queues', value: backendJobQueues.length, detail: 'Agent and publishing jobs by stage' },
            { label: 'Server-only env', value: serverOnlyEnv, detail: 'Secrets never exposed to browser' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <BackendImplementationHandoff />

      <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="border-b border-[#e8e8e4] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#171717]">Supabase database tables</h3>
          <p className="mt-0.5 text-xs text-[#6e6e68]">Proposed source-of-truth tables. RLS is mandatory for every exposed table.</p>
        </div>
        <div className="divide-y divide-[#e8e8e4]">
          {backendDatabaseTables.map((item) => (
            <div key={item.table} className="grid gap-3 px-4 py-4 lg:grid-cols-[180px_130px_minmax(0,1fr)_220px_90px] lg:items-start">
              <div className="font-mono text-xs font-semibold text-[#171717]">{item.table}</div>
              <div className="text-xs font-semibold text-[#4f4f49]">{item.owner}</div>
              <p className="text-xs leading-relaxed text-[#6e6e68]">{item.purpose}</p>
              <p className="text-xs leading-relaxed text-[#4f4f49]">{item.rls}</p>
              <Tag>{item.status}</Tag>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="border-b border-[#e8e8e4] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#171717]">Next.js API contracts</h3>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Route handlers should initialize service clients lazily and log every mutation.</p>
          </div>
          <div className="divide-y divide-[#e8e8e4]">
            {backendApiContracts.map((item) => (
              <div key={item.route} className="grid gap-3 px-4 py-4 lg:grid-cols-[190px_120px_minmax(0,1fr)_minmax(0,1fr)_90px] lg:items-start">
                <div className="font-mono text-xs font-semibold text-[#171717]">{item.route}</div>
                <div className="text-xs font-semibold text-[#4f4f49]">{item.owner}</div>
                <p className="text-xs leading-relaxed text-[#6e6e68]">Input: {item.input}</p>
                <p className="text-xs leading-relaxed text-[#6e6e68]">Output: {item.output}</p>
                <Tag>{item.status}</Tag>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
            <h3 className="text-sm font-semibold text-[#171717]">Security checklist</h3>
            <div className="mt-3 space-y-2">
              {backendSecurityChecklist.map((item, index) => (
                <div key={item} className="flex gap-2 rounded-xl border border-[#deded8] bg-white p-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#deded8] bg-[#fbfbfa] text-[10px] font-semibold text-[#6e6e68]">{index + 1}</span>
                  <p className="text-xs leading-relaxed text-[#4f4f49]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-900">Backend boundary</h3>
            <p className="mt-2 text-xs leading-relaxed text-amber-800">
              Stage 9 is a readiness contract only. Real schema migrations, RLS policies, Edge Functions, and queue workers should be implemented after this map is accepted.
            </p>
          </section>
        </aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h3 className="text-sm font-semibold text-[#171717]">Worker queues</h3>
          <div className="mt-3 space-y-2">
            {backendJobQueues.map((item) => (
              <div key={item.queue} className="rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-[#171717]">{item.queue}</span>
                  <Tag>{item.worker}</Tag>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">Trigger: {item.trigger}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#4f4f49]">Writes: {item.writes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h3 className="text-sm font-semibold text-[#171717]">Environment visibility</h3>
          <div className="mt-3 space-y-2">
            {backendEnvContracts.map((item) => (
              <div key={item.key} className="rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-[#171717]">{item.key}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      item.visibility.includes('Server') ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.visibility}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">Used by: {item.usedBy}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#4f4f49]">Guard: {item.guard}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

