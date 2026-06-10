"use client";

import { usePathname } from "next/navigation";

import Sidebar from "@/components/publisher/Sidebar";

function isAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/publisher/login" || pathname.startsWith("/publisher/auth/");
}

export default function PublisherAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
      <Sidebar />
      <main className="w-full overflow-y-auto px-6 py-8 sm:px-10 lg:px-14">{children}</main>
    </div>
  );
}
