import Link from "next/link"
import { Bell, CircleHelp, LogOut, Search } from "lucide-react"

import { AdminMobileNav } from "@/components/admin/AdminMobileNav"
import { Button } from "@/components/ui/button"
import { roleDisplayLabel } from "@/lib/auth/labels"
import type { Employee } from "@/lib/auth/session"

export function AdminHeader({
  alertBadge = 0,
  user,
}: {
  alertBadge?: number
  user?: Pick<Employee, "name" | "role" | "position">
}) {
  return (
    <header className="z-10 shrink-0 border-b border-border/80 bg-white px-3 py-2 md:px-4 md:py-2.5">
      <div className="flex items-center gap-3">
        <AdminMobileNav />
        <div className="relative mx-auto hidden w-full max-w-xl flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search employees, modules, documents..."
            className="h-9 w-full rounded-full border border-border/80 bg-muted/30 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-brand-red/40 focus-visible:ring-2 focus-visible:ring-brand-red/20"
            aria-label="Search"
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/admin/alerts"
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Alerts"
          >
            <Bell className="size-5" />
            {alertBadge > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white">
                {alertBadge > 9 ? "9+" : alertBadge}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block"
            aria-label="Help"
          >
            <CircleHelp className="size-5" />
          </button>
          {user ? (
            <div className="hidden items-center gap-2 rounded-lg border border-border/80 px-2 py-1 sm:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/mascot-hd.png"
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full object-contain"
              />
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {roleDisplayLabel(user.role)}
                </p>
              </div>
            </div>
          ) : null}
          <form action="/api/auth/logout" method="post" className="hidden md:block">
            <Button variant="ghost" size="sm" type="submit" className="gap-2">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
