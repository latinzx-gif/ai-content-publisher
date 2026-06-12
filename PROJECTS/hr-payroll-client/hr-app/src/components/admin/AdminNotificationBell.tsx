"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Bell,
  CalendarDays,
  Clock,
  FileText,
  MessageCircleWarning,
  Timer,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

import type {
  NotificationItem,
  NotificationKind,
} from "@/features/notifications/types"
import { cn } from "@/lib/utils"

const KIND_META: Record<
  NotificationKind,
  { icon: LucideIcon; tone: string }
> = {
  registration: { icon: UserPlus, tone: "text-brand-red" },
  leave: { icon: CalendarDays, tone: "text-sky-600" },
  attendance: { icon: Clock, tone: "text-amber-600" },
  overtime: { icon: Timer, tone: "text-violet-600" },
  document: { icon: FileText, tone: "text-emerald-600" },
  complaint: { icon: MessageCircleWarning, tone: "text-orange-600" },
  probation: { icon: CalendarDays, tone: "text-amber-700" },
  visa: { icon: CalendarDays, tone: "text-rose-600" },
  work_permit: { icon: CalendarDays, tone: "text-indigo-600" },
}

function formatWhen(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    hour: iso.includes("T") ? "2-digit" : undefined,
    minute: iso.includes("T") ? "2-digit" : undefined,
  })
}

function formatBadgeCount(count: number): string {
  if (count > 99) return "99+"
  return String(count)
}

export function AdminNotificationBell({
  initialApprovalTotal = 0,
  initialTotal = 0,
  initialItems = [],
  showComplianceLink = true,
}: {
  initialApprovalTotal?: number
  initialTotal?: number
  initialItems?: NotificationItem[]
  showComplianceLink?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [cache, setCache] = useState<{
    items: NotificationItem[]
    total: number
    approvalTotal: number
    complianceTotal: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const approvalTotal = cache?.approvalTotal ?? initialApprovalTotal
  const total = cache?.total ?? initialTotal
  const complianceTotal = cache?.complianceTotal ?? Math.max(0, total - approvalTotal)
  const items = cache?.items ?? initialItems

  const refresh = useCallback(async (opts?: { showLoading?: boolean }) => {
    if (opts?.showLoading) setLoading(true)
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" })
      if (!res.ok) return
      const data = (await res.json()) as {
        items: NotificationItem[]
        total: number
        approvalTotal?: number
        complianceTotal?: number
      }
      setCache({
        items: data.items ?? [],
        total: data.total ?? 0,
        approvalTotal: data.approvalTotal ?? 0,
        complianceTotal: data.complianceTotal ?? 0,
      })
    } finally {
      if (opts?.showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const res = await fetch("/api/notifications", { cache: "no-store" })
      if (cancelled || !res.ok) return
      const data = (await res.json()) as {
        items: NotificationItem[]
        total: number
        approvalTotal?: number
        complianceTotal?: number
      }
      if (cancelled) return
      setCache({
        items: data.items ?? [],
        total: data.total ?? 0,
        approvalTotal: data.approvalTotal ?? 0,
        complianceTotal: data.complianceTotal ?? 0,
      })
    })()
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [refresh])

  const toggleOpen = () => {
    setOpen((wasOpen) => {
      const next = !wasOpen
      if (next) void refresh({ showLoading: true })
      return next
    })
  }

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={
          approvalTotal > 0
            ? `การแจ้งเตือน — รออนุมัติ ${approvalTotal} รายการ`
            : "การแจ้งเตือน"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="size-5" />
        {approvalTotal > 0 ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
            aria-hidden
          >
            {formatBadgeCount(approvalTotal)}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="รายการแจ้งเตือน"
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border/80 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
            <p className="text-sm font-semibold">การแจ้งเตือน</p>
            {loading ? (
              <span className="text-xs text-muted-foreground">กำลังโหลด…</span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {approvalTotal > 0 ? (
                  <>
                    รออนุมัติ{" "}
                    <span className="font-semibold text-brand-red">
                      {approvalTotal}
                    </span>
                  </>
                ) : (
                  "ไม่มีรายการรออนุมัติ"
                )}
                {complianceTotal > 0
                  ? ` · แจ้งเตือน ${complianceTotal}`
                  : null}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                ไม่มีรายการค้าง
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {items.map((item) => {
                  const meta = KIND_META[item.kind]
                  const Icon = meta.icon
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex gap-2.5 px-3 py-2.5 transition-colors hover:bg-muted/50"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60",
                            meta.tone
                          )}
                        >
                          <Icon className="size-4" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-tight">
                              {item.title}
                            </p>
                            {item.urgency === "urgent" ? (
                              <span className="shrink-0 rounded-full bg-brand-red/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-red">
                                ด่วน
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {item.summary}
                          </p>
                          {item.createdAt ? (
                            <p className="mt-1 text-[10px] text-muted-foreground/80">
                              {formatWhen(item.createdAt)}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-1 border-t border-border/60 bg-muted/20 px-3 py-2">
            {total > items.length ? (
              <p className="text-center text-[10px] text-muted-foreground">
                แสดง {items.length} จาก {total} รายการ
              </p>
            ) : null}
            {showComplianceLink ? (
              <Link
                href="/admin/alerts"
                onClick={() => setOpen(false)}
                className="text-center text-xs font-medium text-brand-red hover:underline"
              >
                ดูแจ้งเตือนทดลองงาน / วีซ่า / Work Permit
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
