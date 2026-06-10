'use client';

import { MessageSquareText, ShieldCheck } from 'lucide-react';
import { UsersIcon } from '@/features/prd/components/icons/prd-icons';
import { MiniPageCard } from '@/features/prd/components/MiniPageCard';
import { BrandVoiceCard } from '@/features/prd/components/BrandVoiceCard';
import { RulesPillPanel } from '@/features/prd/components/RulesPillPanel';
import {
  coreServices,
  imageGenerationConnector,
  prohibitedTerms,
  targetAudiences,
  teamMembers,
} from '@/features/prd/config/rules-brand';

export function RulesBrandView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <MiniPageCard label="Team roles" value="4" detail="Admin, lawyer, accountant, editor" icon={UsersIcon} />
          <MiniPageCard label="Voice profiles" value="2" detail="Lawyer and accounting modes" icon={MessageSquareText} />
          <MiniPageCard label="Guardrails" value="12" detail="Forbidden claims and review rules" icon={ShieldCheck} />
        </div>

        <section className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="border-b border-[#e8e8e4] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#171717]">Team Members & Permissions</h2>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Control who can post, approve, review, or only edit drafts.</p>
          </div>
          <div className="divide-y divide-[#e8e8e4]">
            {teamMembers.map((member) => (
              <div key={member.name} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_132px_220px_84px] md:items-center">
                <div className="min-w-0 text-sm font-semibold text-[#171717]">{member.name}</div>
                <span className="w-fit rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">{member.role}</span>
                <div className="min-w-0 text-xs leading-relaxed text-[#6e6e68]">{member.access}</div>
                <button className="w-full rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] md:w-auto" type="button">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <BrandVoiceCard
            title="Lawyer Brand Voice"
            tone="Professional, precise, careful, citation-first"
            rules={[
              'Avoid guaranteeing legal outcomes.',
              'Use cautious wording for litigation and compliance risk.',
              'Always reference legal basis when making claims.',
            ]}
          />
          <BrandVoiceCard
            title="Accounting Brand Voice"
            tone="Clear, practical, deadline-aware, business-friendly"
            rules={[
              'Explain tax/accounting duties in simple operational language.',
              'Mention deadlines and required documents clearly.',
              'Avoid promising exact tax savings without context.',
            ]}
          />
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h2 className="text-sm font-semibold text-[#171717]">What AI should know about us</h2>
          <p className="mt-1 text-xs text-[#6e6e68]">Office-specific context used before drafting, reviewing, or translating content.</p>
          <textarea
            className="mt-3 min-h-28 w-full resize-none rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3 text-sm leading-relaxed text-[#2f3a4b] outline-none ring-[#2f4f7f] focus:ring-1"
            defaultValue="We are a professional legal and accounting advisory office serving Thai SMEs, foreign investors, and founders who need practical compliance guidance. Content should be accurate, cautious, helpful, and never overpromise outcomes."
          />
        </section>
      </section>

      <aside className="space-y-4">
        <RulesPillPanel title="Prohibited words / claims" items={prohibitedTerms} tone="danger" />
        <RulesPillPanel title="Target Audience" items={targetAudiences} />
        <RulesPillPanel title="Core Services" items={coreServices} />

        <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">System rule summary</h2>
          <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">
            AI must follow professional ethics, avoid exaggerated claims, cite Knowledge Base sources, and route legal/tax risk to Review Queue before publishing.
          </p>
        </section>
      </aside>
    </div>
  );
}
