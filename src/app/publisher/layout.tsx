import type { Metadata } from "next";

import PublisherAppShell from "@/components/publisher/AppShell";

export const metadata: Metadata = {
  title: "Content OS",
  description: "Automated Content + Image + Publishing",
};

export default function PublisherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased overflow-auto">
      <PublisherAppShell>{children}</PublisherAppShell>
    </div>
  );
}
