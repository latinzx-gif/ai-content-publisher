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
  return <PublisherAppShell>{children}</PublisherAppShell>;
}
