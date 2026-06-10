'use client';

import { Bot, Check, ChevronRight, Circle, Lock, UploadCloud } from 'lucide-react';
import { useState } from 'react';

export function SettingsCodexConnection() {
  const [codexConnectionStatus, setCodexConnectionStatus] = useState<'Ready' | 'Testing' | 'Connected'>('Ready');
  const [codexLastAction, setCodexLastAction] = useState('Waiting for local bridge approval');
  const [codexActivity, setCodexActivity] = useState([
    { time: 'now', title: 'Codex Local page opened', detail: 'Settings prepared for local workspace bridge.' },
    { time: 'ready', title: 'Workspace allowlist loaded', detail: '/Users/jakarinosk/HEAD-OFFICE/head-office-app' },
  ]);

  const addCodexActivity = (title: string, detail: string) => {
    setCodexActivity((current) => [{ time: 'now', title, detail }, ...current].slice(0, 5));
  };

  const handleTestConnection = () => {
    setCodexConnectionStatus('Testing');
    setCodexLastAction('Testing local Codex bridge permissions');
    addCodexActivity('Connection test requested', 'Checking desktop app, workspace path, and allowed agent actions.');
    window.setTimeout(() => {
      setCodexConnectionStatus('Ready');
      setCodexLastAction('Local bridge responded');
      addCodexActivity('Connection test passed', 'Mock bridge is ready. Backend signed bridge is the next implementation task.');
    }, 450);
  };

  const handleConnectLocalCodex = () => {
    setCodexConnectionStatus('Connected');
    setCodexLastAction('Connected to local Codex runtime');
    addCodexActivity('Local Codex connected', 'Audit, task planning, and staged edit commands are enabled in UI mode.');
  };

  const handleOpenWorkspace = () => {
    setCodexLastAction('Workspace open request recorded');
    addCodexActivity('Open workspace requested', 'A real bridge would open the approved HEAD-OFFICE workspace in Codex.');
  };

  const codexHealth = [
    { label: 'Desktop app', value: codexConnectionStatus === 'Connected' ? 'Connected' : 'Detected', detail: 'Codex local session is available on this machine.' },
    { label: 'Workspace', value: 'HEAD-OFFICE', detail: '/Users/jakarinosk/HEAD-OFFICE/head-office-app' },
    { label: 'Agent mode', value: 'Local first', detail: 'Use local Codex for audits, task planning, and safe file edits.' },
    { label: 'Access scope', value: 'Project only', detail: 'Recommended: limit actions to approved workspace paths.' },
  ];

  const codexActions = [
    'Audit current page and create tasks',
    'Run local health checks after each stage',
    'Prepare code changes from approved tasks',
    'Write workflow logs for agent handoff',
  ];

  const codexPermissionMatrix = [
    { action: 'Audit page/workflow', status: 'Allowed', detail: 'Read rendered UI, compare stage requirements, and create task notes.' },
    { action: 'Edit approved files', status: 'Allowed with task', detail: 'Only after the task is part of the approved stage roadmap.' },
    { action: 'Run checks', status: 'Allowed', detail: 'Lint, curl health, and browser smoke audits after each completed stage.' },
    { action: 'Destructive git actions', status: 'Blocked', detail: 'No reset, checkout, revert, or amend without explicit user approval.' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Codex Local Connection</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">
            Connect this web workspace with the Codex app running on your Mac so local audits, staged tasks, and agent handoffs can be controlled from the platform.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {codexConnectionStatus === 'Testing' ? 'Testing bridge' : codexConnectionStatus === 'Connected' ? 'Local bridge connected' : 'Local bridge ready'}
        </span>
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#deded8] bg-[#eeeeea]">
              <Bot className="h-5 w-5 text-[#171717]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#171717]">Codex Desktop Bridge</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-[#6e6e68]">
                Mock-ready UI for local Codex connection. Backend endpoint can later call a signed local bridge or approved agent runner.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <button
              onClick={handleTestConnection}
              className="flex-1 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-white sm:flex-none"
              type="button"
            >
              {codexConnectionStatus === 'Testing' ? 'Testing...' : 'Test connection'}
            </button>
            <button onClick={handleConnectLocalCodex} className="flex-1 rounded-lg bg-[#171717] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2f2f2b] sm:flex-none" type="button">
              {codexConnectionStatus === 'Connected' ? 'Connected' : 'Connect local Codex'}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs leading-relaxed text-[#2f4f7f]">
          Current status: {codexLastAction}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {codexHealth.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
              <div className="mt-2 truncate text-sm font-semibold text-[#171717]">{item.value}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Local connection settings</h3>
              <p className="mt-1 text-xs text-[#6e6e68]">Keep the values explicit so users understand what Codex can access.</p>
            </div>
            <button onClick={handleOpenWorkspace} className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Open workspace
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Workspace path</span>
              <input
                className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
                defaultValue="/Users/jakarinosk/HEAD-OFFICE/head-office-app"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Local bridge endpoint</span>
              <input
                className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
                defaultValue="codex://local/head-office"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Default audit rule</span>
              <select className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1" defaultValue="Audit after every stage">
                <option>Audit after every stage</option>
                <option>Audit only before deploy</option>
                <option>Manual approval only</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Agent execution</span>
              <select className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1" defaultValue="Plan first, edit after approval">
                <option>Plan first, edit after approval</option>
                <option>Auto-fix low risk tasks</option>
                <option>Read-only audit mode</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Log destination</span>
              <input
                className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
                defaultValue="Workflow Logs / system_logs"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Stage gate</span>
              <input
                className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
                defaultValue="Audit must pass before next stage"
              />
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            Safety note: production should never expose unrestricted local file access from the browser. Use a signed local bridge, explicit workspace allowlist, and per-action approval logs.
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
            <h3 className="text-sm font-semibold text-[#171717]">What Codex can do here</h3>
            <div className="mt-3 space-y-2">
              {codexActions.map((action, index) => (
                <div key={action} className="flex gap-3 rounded-xl border border-[#e0e0da] bg-white px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eeeeea] text-[11px] font-semibold text-[#4f4f49]">{index + 1}</span>
                  <span className="text-xs leading-relaxed text-[#4f4f49]">{action}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h3 className="text-sm font-semibold text-[#171717]">Permission matrix</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Defines what the web app may ask local Codex to do before a signed bridge is implemented.</p>
            <div className="mt-3 space-y-2">
              {codexPermissionMatrix.map((item) => (
                <div key={item.action} className="rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#171717]">{item.action}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        item.status === 'Blocked' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h3 className="text-sm font-semibold text-[#171717]">Local activity</h3>
            <div className="mt-3 space-y-3">
              {codexActivity.map((item) => (
                <div key={`${item.time}-${item.title}-${item.detail}`} className="border-l border-[#deded8] pl-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#171717]">{item.title}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a82]">{item.time}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

