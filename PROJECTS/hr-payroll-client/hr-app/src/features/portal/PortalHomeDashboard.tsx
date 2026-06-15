import Link from "next/link"
import {
  Barcode,
  CalendarDays,
  Clock,
  ExternalLink,
  Megaphone,
  MessageSquareWarning,
  Package,
  QrCode,
  Timer,
} from "lucide-react"

import { WidgetCard } from "@/components/brand/WidgetCard"
import type { AnnouncementRow } from "@/features/announcements/data"
import { LEAVE_TYPE_LABELS, LEAVE_TYPES } from "@/features/leave/types"
import type { LeaveBalance } from "@/features/leave/LeaveBalanceCard"
import type { TodayAttendanceStatus } from "@/features/portal/data"

function LiffLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
    >
      {children}
      <ExternalLink className="size-3.5 text-muted-foreground" />
    </Link>
  )
}

export function PortalHomeDashboard({
  employeeName,
  attendance,
  balances,
  announcements,
}: {
  employeeName: string
  attendance: TodayAttendanceStatus
  balances: LeaveBalance[]
  announcements: AnnouncementRow[]
}) {
  const byType = new Map(balances.map((b) => [b.leave_type, b]))
  const topBalances = LEAVE_TYPES.slice(0, 4)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          สวัสดี, {employeeName}
        </h1>
        <p className="text-sm text-muted-foreground">
          สรุปวันนี้และทางลัดไปยังบริการ HR
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <WidgetCard compact title="สถานะเช็คอินวันนี้" href="/portal/attendance">
          {attendance.checkedIn ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-brand-red" />
                <span>
                  เข้า {attendance.checkInText} น.
                  {attendance.isLate ? (
                    <span className="ml-1 text-amber-600">(สาย)</span>
                  ) : null}
                </span>
              </div>
              {attendance.checkOutText ? (
                <p className="text-muted-foreground">
                  ออก {attendance.checkOutText} น.
                  {attendance.workHours != null
                    ? ` · ${attendance.workHours.toFixed(1)} ชม.`
                    : ""}
                </p>
              ) : attendance.inProgress ? (
                <p className="text-muted-foreground">กำลังทำงาน — ยังไม่เช็คเอาท์</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              ยังไม่ได้เช็คอินวันนี้ — สแกน QR หรือใช้ลิงก์ด้านล่าง
            </p>
          )}
        </WidgetCard>

        <WidgetCard compact title="วันลาคงเหลือ" href="/portal/leave">
          <dl className="grid grid-cols-2 gap-2">
            {topBalances.map((type) => {
              const balance = byType.get(type)
              const remaining = balance
                ? balance.total_days - balance.used_days
                : null
              return (
                <div key={type} className="rounded-lg bg-muted/40 p-2">
                  <dt className="text-[11px] text-muted-foreground">
                    {LEAVE_TYPE_LABELS[type]}
                  </dt>
                  <dd className="text-base font-semibold tabular-nums">
                    {remaining === null ? "—" : `${remaining} วัน`}
                  </dd>
                </div>
              )
            })}
          </dl>
        </WidgetCard>

        <WidgetCard
          compact
          title="ประกาศล่าสุด"
          href="/portal/announcements"
          actionLabel="ดูทั้งหมด"
        >
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีประกาศ</p>
          ) : (
            <ul className="space-y-2">
              {announcements.slice(0, 3).map((item) => (
                <li key={item.id} className="flex gap-2 text-sm">
                  <Megaphone className="mt-0.5 size-4 shrink-0 text-brand-red" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>
      </div>

      <WidgetCard compact title="ทางลัด LIFF">
        <div className="flex flex-wrap gap-2">
          <LiffLink href="/liff/leave">
            <CalendarDays className="size-4 text-brand-red" />
            ขอลา
          </LiffLink>
          <LiffLink href="/liff/attendance">
            <Clock className="size-4 text-brand-red" />
            ยื่นสรุปวัน
          </LiffLink>
          <LiffLink href="/portal/profile">
            <QrCode className="size-4 text-brand-red" />
            QR เช็คอิน
          </LiffLink>
          <LiffLink href="/liff/documents">
            <ExternalLink className="size-4 text-brand-red" />
            ขอเอกสาร
          </LiffLink>
          <LiffLink href="/liff/overtime">
            <Timer className="size-4 text-brand-red" />
            ขอ OT
          </LiffLink>
          <LiffLink href="/liff/complaint">
            <MessageSquareWarning className="size-4 text-brand-red" />
            ร้องเรียน
          </LiffLink>
          <LiffLink href="/portal/inbound">
            <Barcode className="size-4 text-brand-red" />
            สแกนรับเข้า
          </LiffLink>
          <LiffLink href="/portal/stock">
            <Package className="size-4 text-brand-red" />
            เช็คสต็อก
          </LiffLink>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          เช็คอินด้วย QR ประจำวัน — ดาวน์โหลดจากหน้าโปรไฟล์ · ประกาศจาก HR ส่งทาง LINE
        </p>
      </WidgetCard>
    </div>
  )
}
