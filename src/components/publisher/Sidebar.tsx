"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/publisher/ui/badge";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/publisher/actions";

type Phase = "P1" | "P2" | "P3";

type RouteItem = {
  href: string;
  label: string;
  phase: Phase;
};

type RouteGroup = {
  title: string;
  items: RouteItem[];
};

const routeGroups: RouteGroup[] = [
  {
    title: "Main",
    items: [
      { href: "/publisher/create", label: "Create", phase: "P1" },
      { href: "/publisher/review", label: "Review", phase: "P1" },
      { href: "/publisher/calendar", label: "Calendar", phase: "P1" },
      { href: "/publisher/publishing", label: "Publishing", phase: "P1" },
    ],
  },
  {
    title: "Workflow",
    items: [
      { href: "/publisher/briefs", label: "Brief Builder", phase: "P1" },
      { href: "/publisher/sources", label: "Sources", phase: "P2" },
      { href: "/publisher/knowledge", label: "Knowledge", phase: "P2" },
      { href: "/publisher/rules", label: "Rules", phase: "P1" },
      { href: "/publisher/content-generation", label: "Content Generation", phase: "P1" },
      { href: "/publisher/image-prompts", label: "Image Prompts", phase: "P1" },
      { href: "/publisher/images", label: "Images", phase: "P1" },
      { href: "/publisher/quality-check", label: "Quality Check", phase: "P1" },
      { href: "/publisher/content-library", label: "Content Library", phase: "P2" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { href: "/publisher/analytics", label: "Analytics", phase: "P2" },
      { href: "/publisher/learning-loop", label: "Learning Loop", phase: "P3" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/publisher/logs", label: "Logs", phase: "P1" },
      { href: "/publisher/settings", label: "Settings", phase: "P1" },
    ],
  },
];

// P1 items are the live product — no badge. Later phases stay visible but
// clearly marked and dimmed.
function phaseBadge(phase: Phase) {
  if (phase === "P2") {
    return (
      <Badge variant="outline" className="border-transparent bg-[var(--gold-soft)] text-[var(--gold-ink)]">
        Phase 2
      </Badge>
    );
  }
  if (phase === "P3") {
    return (
      <Badge variant="outline" className="border-transparent bg-[var(--blue-soft)] text-[var(--blue-ink)]">
        Phase 3
      </Badge>
    );
  }
  return null;
}

export default function Sidebar() {
  const pathname = usePathname();

  function isActiveRoute(itemHref: string) {
    if (!pathname) return false;
    if (pathname === itemHref) return true;
    return pathname.startsWith(`${itemHref}/`);
  }

  return (
    <aside className="flex max-h-[42vh] flex-col overflow-y-auto bg-[var(--navy)] px-4 py-6 text-[var(--paper)] lg:sticky lg:top-0 lg:h-screen lg:max-h-screen">
      <div className="flex items-center gap-3 px-2 pb-7">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold tracking-wide">
          SW
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-tight">Content OS</h1>
          <p className="truncate text-xs text-white/55">AI Content Publisher</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6">
        {routeGroups.map((group) => (
          <div key={group.title}>
            <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              {group.title}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = isActiveRoute(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white",
                        item.phase !== "P1" && "opacity-55",
                        isActive && "bg-white/10 font-medium text-white"
                      )}
                      href={item.href}
                    >
                      <span className="truncate">{item.label}</span>
                      {phaseBadge(item.phase)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-6 border-t border-white/10 pt-4">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
