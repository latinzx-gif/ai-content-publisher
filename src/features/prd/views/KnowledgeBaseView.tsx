'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Bot, Clock3, Layers3, Link2, MessageSquareText, Search, ShieldCheck, UploadCloud } from 'lucide-react';
import { GlobeIcon } from '@/features/prd/components/icons/prd-icons';
import { MiniPageCard } from '@/features/prd/components/MiniPageCard';
import { KnowledgeConnectionCard } from '@/features/prd/components/KnowledgeConnectionCard';
import { KnowledgeSourceRow } from '@/features/prd/components/KnowledgeSourceRow';
import { DriveIcon, ObsidianIcon } from '@/features/prd/components/icons/prd-icons';
import { knowledgeSources, ragRules } from '@/features/prd/config/knowledge-base-display';
import type { RagChatApiResponse, RagCitationCard } from '@/features/prd/types/api';

export function KnowledgeBaseView({ apiToken, onNoopAction }: { apiToken: string; onNoopAction: (message: string) => void }) {
  const [ragQuery, setRagQuery] = useState('What changed in VAT filing rules? Cite the source and show related Obsidian notes.');
  const [ragStatus, setRagStatus] = useState<'ready' | 'retrieving' | 'answered' | 'blocked' | 'error'>('ready');
  const [ragAnswer, setRagAnswer] = useState('Run live RAG retrieval to see cited answers from connected sources.');
  const [ragError, setRagError] = useState('');
  const fallbackRagCitations: RagCitationCard[] = [];
  const [ragCitations, setRagCitations] = useState<RagCitationCard[]>(fallbackRagCitations);
  const hasRagQuery = Boolean(ragQuery.trim());
  const runRagSearch = async () => {
    if (!hasRagQuery) {
      setRagStatus('blocked');
      setRagAnswer('RAG search blocked: query is required.');
      onNoopAction('RAG search blocked: query is required');
      return;
    }

    const token = apiToken.trim().replace(/^Bearer\s+/i, '');

    if (!token) {
      setRagStatus('blocked');
      setRagAnswer('Sign in to run live RAG retrieval.');
      setRagCitations(fallbackRagCitations);
      onNoopAction('Live RAG search blocked: API bearer token is required');
      return;
    }

    setRagStatus('retrieving');
    setRagError('');

    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: ragQuery,
          strictCitation: true,
        }),
      });
      const payload = (await response.json()) as RagChatApiResponse & { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.message || payload.error || 'RAG chat request failed');
      }

      setRagAnswer(payload.answer);
      setRagCitations(
        payload.citations.length
          ? payload.citations.map((citation) => ({
              source: citation.title,
              match: `${Math.round(citation.score * 100)}%`,
              detail: `${citation.sourceType}${citation.category ? ` · ${citation.category}` : ''} · chunk ${citation.chunkId.slice(0, 8)}`,
            }))
          : [],
      );
      setRagStatus(payload.blocked ? 'blocked' : 'answered');
      onNoopAction(payload.blocked ? `RAG blocked: ${payload.reason ?? 'No source matched'}` : `RAG answered with ${payload.citations.length} citation(s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'RAG retrieval failed';
      setRagStatus('error');
      setRagError(message);
      setRagAnswer(message);
      onNoopAction(`RAG retrieval failed: ${message}`);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#deded8] bg-white p-2 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          {['Sources', 'Connections', 'Test RAG Knowledge'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => onNoopAction(`Switch knowledge tab: ${tab}`)}
              className={`h-9 rounded-xl px-3 text-sm font-semibold ${
                index === 2
                  ? 'border border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]'
                  : 'text-[#6e6e68] hover:bg-[#f6f6f2] hover:text-[#171717]'
              }`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <MiniPageCard label="Indexed sources" value="126" detail="Ready for RAG retrieval" icon={BookOpen} />
          <MiniPageCard label="Processing" value="3" detail="PDFs being chunked" icon={Clock3} />
          <MiniPageCard label="Review needed" value="5" detail="Outdated or risky claims" icon={ShieldCheck} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2]">
                <UploadCloud className="h-5 w-5 text-[#4f4f49]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#171717]">Upload PDF / document</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Add legal notices, Revenue Department announcements, SOPs, or company guidelines.</p>
                <button
                  onClick={() => onNoopAction('Upload PDF or document')}
                  className="mt-3 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-white"
                  type="button"
                >
                  Choose file
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2]">
                <GlobeIcon className="h-5 w-5 text-[#4f4f49]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-[#171717]">Connect source link</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Connect official links so AI can retrieve trusted references before writing.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input className="h-8 min-w-0 flex-1 rounded-lg border border-[#deded8] bg-[#fbfbfa] px-3 text-xs outline-none" placeholder="https://..." />
                  <button
                    onClick={() => onNoopAction('Add source link')}
                    className="h-8 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
                    type="button"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">External knowledge connections</h2>
              <p className="mt-1 text-xs text-[#6e6e68]">Connect office files and notes so RAG can retrieve approved internal knowledge.</p>
            </div>
            <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
              2 available
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <KnowledgeConnectionCard name="Google Drive" description="Sync PDFs, Docs, Sheets, and shared folders." icon={DriveIcon} status="Connect" />
            <KnowledgeConnectionCard name="Obsidian" description="Index local vault notes, markdown files, and backlinks." icon={ObsidianIcon} status="Connect" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Office knowledge sources</h2>
              <p className="mt-0.5 text-xs text-[#6e6e68]">Documents that AI is allowed to retrieve from before generating content.</p>
            </div>
            <button
              onClick={() => onNoopAction('Search knowledge sources')}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              type="button"
            >
              <Search className="h-3.5 w-3.5" />
              Search sources
            </button>
          </div>

          <div className="divide-y divide-[#e8e8e4]">
            {knowledgeSources.map((source) => (
              <KnowledgeSourceRow key={source.name} source={source} />
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-[#cfd8ea] bg-[#f8fbff] p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#cfd8ea] bg-white text-[#2f4f7f]">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">AI Chat Bot</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Test RAG retrieval across uploaded files, Google Drive, Obsidian, and official source links.</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[#cfd8ea] bg-white p-3">
            <textarea
              value={ragQuery}
              onChange={(event) => {
                setRagQuery(event.target.value);
                if (event.target.value.trim()) {
                  setRagStatus('ready');
                }
              }}
              className="min-h-28 w-full resize-none rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3 text-xs text-[#171717] outline-none ring-[#2f4f7f] placeholder:text-[#8a8a82] focus:ring-1"
              placeholder="Ask: What changed in VAT filing rules? Cite the source and show related Obsidian notes..."
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {['PDF', 'Drive', 'Obsidian'].map((source) => (
                  <span key={source} className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">
                    {source}
                  </span>
                ))}
              </div>
              <button
                onClick={runRagSearch}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfd8ea] bg-[#f4f7fd] px-3 text-xs font-semibold text-[#2f4f7f] hover:bg-white"
                type="button"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: 'No source', status: 'blocked' },
                { label: 'Error state', status: 'error' },
                { label: 'Retrieving', status: 'retrieving' },
              ].map((state) => (
                <button
                  key={state.status}
                  onClick={() => setRagStatus(state.status as typeof ragStatus)}
                  className="rounded-lg border border-[#deded8] bg-[#fbfbfa] px-2 py-1 text-[10px] font-semibold text-[#6e6e68] hover:bg-white"
                  type="button"
                >
                  {state.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-[#cfd8ea] bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#171717]">Retrieval status</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  ragStatus === 'blocked' || ragStatus === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : ragStatus === 'answered'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]'
                }`}
              >
                {ragStatus === 'answered' ? 'Citations ready' : ragStatus === 'blocked' ? 'Blocked' : ragStatus === 'error' ? 'Error' : ragStatus === 'retrieving' ? 'Retrieving' : 'Ready'}
              </span>
            </div>

            {ragStatus === 'blocked' ? (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-800">
                {ragAnswer || 'No query or approved source was found. AI answer is blocked until a source is uploaded, indexed, or connected.'}
              </div>
            ) : ragStatus === 'error' ? (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                {ragError || 'Retrieval failed. Check Drive/Obsidian permissions, source indexing, or retry after processing completes.'}
              </div>
            ) : ragStatus === 'answered' ? (
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
                  {ragAnswer}
                </div>
                {ragCitations.map((citation) => (
                  <div key={citation.source} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#171717]">{citation.source}</span>
                      <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{citation.match}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{citation.detail}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3 text-xs leading-relaxed text-[#6e6e68]">
                Enter a question and run search. If no indexed source matches, generation remains blocked instead of guessing.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">RAG guardrail</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">
                AI must use this knowledge base as the trusted retrieval layer before making legal or accounting claims.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {ragRules.map((rule) => (
              <div key={rule} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3 text-xs leading-relaxed text-[#4f4f49]">
                {rule}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">Hallucination control</h2>
          <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">
            If the AI cannot retrieve a relevant indexed source, generation is blocked and the user is asked to upload a source or connect an official link.
          </p>
        </section>
      </aside>
    </div>
  );
}
