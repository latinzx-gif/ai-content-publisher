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
    title: "MAIN",
    items: [
      { href: "/publisher/create", label: "Create", phase: "P1" },
      { href: "/publisher/review", label: "Review", phase: "P1" },
      { href: "/publisher/calendar", label: "Calendar", phase: "P1" },
      { href: "/publisher/publishing", label: "Publishing", phase: "P1" },
    ],
  },
  {
    title: "WORKFLOW",
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
    title: "INTELLIGENCE",
    items: [
      { href: "/publisher/analytics", label: "Analytics", phase: "P2" },
      { href: "/publisher/learning-loop", label: "Learning Loop", phase: "P3" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/publisher/logs", label: "Logs", phase: "P1" },
      { href: "/publisher/settings", label: "Settings", phase: "P1" },
    ],
  },
];

function phaseLabel(phase: Phase) {
  if (phase === "P2") return "(Phase 2)";
  if (phase === "P3") return "(Phase 3)";
  return "P1";
}

function phaseBadgeClass(phase: Phase) {
  if (phase === "P2") return "border-[var(--gold-soft)] bg-[var(--gold-soft)] text-[var(--gold-ink)]";
  if (phase === "P3") return "border-[var(--blue-soft)] bg-[var(--blue-soft)] text-[var(--blue-ink)]";
  return "border-[var(--emerald-soft)] bg-[var(--emerald-soft)] text-[var(--emerald)]";
}

export default function Sidebar() {
  const pathname = usePathname();

  function isActiveRoute(itemHref: string) {
    if (!pathname) return false;
    if (pathname === itemHref) return true;
    if (itemHref === "/") return pathname === "/";
    return pathname.startsWith(`${itemHref}/`);
  }

  return (
    <aside className="max-h-[42vh] overflow-y-auto bg-[var(--navy)] px-5 py-7 text-[var(--paper)] lg:sticky lg:top-0 lg:h-screen lg:max-h-screen">
      <div className="brand">
        <div className="logo">SW</div>
        <div>
          <h1>Content OS</h1>
          <p>AI Content Publisher</p>
        </div>
      </div>

          {routeGroups.map((group) => (
    <div className="nav-group" key={group.title}>
      <div className="nav-title">{group.title}</div>
      {group.items.map((item) => {
            const isActive = isActiveRoute(item.href);

            return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "nav-link",
                isActive &&
                  "bg-[color-mix(in_srgb,var(--paper),transparent_90%)] text-[var(--paper)]"
              )}
              href={item.href}
              key={item.href}
            >
              <span>{item.label}</span>
              <Badge variant="outline" className={phaseBadgeClass(item.phase)}>
                {phaseLabel(item.phase)}
              </Badge>
            </Link>
            );
          })}
        </div>
      ))}

      <div className="nav-group mt-auto pt-4 border-t border-white/10">
        <form action={signOut}>
          <button
            type="submit"
            className="nav-link w-full text-left opacity-60 hover:opacity-100 transition-opacity"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
