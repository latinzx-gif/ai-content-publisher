"use client";

import type { DemoPost } from "@/lib/publisher/demo/types";

interface AttentionItemsProps {
  posts: DemoPost[];
}

export function AttentionItems({ posts }: AttentionItemsProps) {
  const items = [
    {
      label: "Needs text review",
      count: posts.filter((p) => p.status === "text_approved").length,
      href: "/publisher/demo/approvals",
    },
    {
      label: "Changes requested",
      count: posts.filter((p) => p.status === "changes_requested").length,
      href: "/publisher/demo/approvals",
    },
    {
      label: "Image pending",
      count: posts.filter((p) => p.status === "image_pending").length,
      href: "/publisher/demo/approvals",
    },
    {
      label: "Failed to publish",
      count: posts.filter((p) => p.status === "failed").length,
      href: "/publisher/demo/approvals",
    },
  ].filter((item) => item.count > 0);

  return (
    <div className="rounded-xl border border-[var(--line-warm)] bg-[var(--paper)] p-5">
      <h2 className="text-sm font-semibold text-[var(--charcoal)] mb-3 uppercase tracking-wide">
        Needs Attention
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">All clear — nothing needs attention.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[var(--bg)] transition-colors"
              >
                <span className="text-sm text-[var(--charcoal)]">{item.label}</span>
                <span className="text-sm font-semibold text-[var(--navy)] bg-[var(--gold-soft)] px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
