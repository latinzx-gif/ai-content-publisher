'use client';

import { FileText, Send } from 'lucide-react';
import type { ReactNode } from 'react';

import type { PublishingChannelSummary } from '@/features/prd/types/api';

export type ChannelCardProps = {
  channel: PublishingChannelSummary;
};

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 8.5V6.9c0-.8.2-1.3 1.4-1.3H17V2.8c-.8-.1-1.7-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v1.6H7.5v3.2h2.8v8.8H14v-8.8h2.8l.4-3.2H14z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.4 8.6H2.6v12.1h2.8V8.6zM4 3.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM21.4 14.1c0-3.7-2-5.8-4.7-5.8-2.1 0-3.1 1.2-3.6 2V8.6h-2.8v12.1h2.8v-6.4c0-1.7.8-3.2 2.6-3.2 1.7 0 2.8 1.1 2.8 3.4v6.2h2.9v-6.6z" />
    </svg>
  );
}

function BufferIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 0 20" />
      <path d="M12 2a15.3 15.3 0 0 0 0 20" />
    </svg>
  );
}

function getPublishingChannelIcon(name: string, className?: string): ReactNode {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('facebook')) return <FacebookIcon className={className} />;
  if (normalizedName.includes('buffer')) return <BufferIcon className={className} />;
  if (normalizedName.includes('wordpress')) return <GlobeIcon className={className} />;
  if (normalizedName.includes('newsletter') || normalizedName.includes('email')) return <FileText className={className} />;
  if (normalizedName.includes('linkedin')) return <LinkedInIcon className={className} />;

  return <Send className={className} />;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const failed = channel.status === 'Failed';

  return (
    <div
      className={`group flex min-w-[148px] flex-1 items-center gap-2 rounded-xl border px-2.5 py-2 sm:flex-none ${
        failed ? 'border-rose-200 bg-rose-50/70' : 'border-[#deded8] bg-[#fbfbfa] hover:bg-white'
      }`}
      title={`${channel.name}: ${channel.health} · Last sync ${channel.sync}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white ${
          failed ? 'border-rose-200 text-rose-700' : 'border-[#deded8] text-[#4f4f49]'
        }`}
      >
        {getPublishingChannelIcon(channel.name, 'h-4 w-4')}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-xs font-semibold text-[#171717]">{channel.name}</h3>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${failed ? 'bg-rose-500' : 'bg-emerald-500'}`}
            aria-label={channel.status}
          />
        </div>
        <p className={`mt-0.5 truncate text-[10px] font-medium ${failed ? 'text-rose-700' : 'text-[#6e6e68]'}`}>
          {channel.queue} queue · {channel.sync}
        </p>
      </div>
    </div>
  );
}
