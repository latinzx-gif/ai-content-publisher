import Link from "next/link"
import { AlertTriangle, Briefcase, Clock3, LogIn, Plane } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/brand/KpiCard"
import type { DailyRoster, DailyRosterEmployeeStatus } from "@/lib/attendance/daily-roster"
import { cn } from "@/lib/utils"

function badgeVariant(status: DailyRosterEmployeeStatus) {
  if (status === "late" || status === "absent") return "destructive" as const
  if (status === "on_leave") return "secondary" as const
  return "outline" as const
}

export function AttendanceTodayRoster({ roster }: { roster: DailyRoster }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="เช็คอินแล้ว" value={roster.totals.checkedIn} icon={LogIn} accent="success" />
        <KpiCard label="มาสาย" value={roster.totals.late} icon={AlertTriangle} accent="warning" />
        <KpiCard label="ลา" value={roster.totals.onLeave} icon={Plane} accent="info" />
        <KpiCard label="ขาด" value={roster.totals.absent} icon={Briefcase} />
      </div>

      {roster.totals.pending > 0 ? (
        <p className="text-sm text-muted-foreground">
          พนักงานที่ยังไม่เช็คอินแต่ยังอยู่ในช่วง grace: {roster.totals.pending} คน
        </p>
      ) : null}

      <div className="grid gap-4">
        {roster.groups.map((group, index) => (
          <Card key={group.id} className="overflow-hidden">
            <details open={group.id === roster.nextShiftId || index === 0} className="group">
              <summary className="cursor-pointer list-none px-4 py-4">
                <CardHeader className="px-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle>{group.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {group.timeRange} • {group.stateLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {group.id === roster.nextShiftId ? (
                        <Badge variant="outline">กำลังกะถัดไป</Badge>
                      ) : null}
                      <span>เช็คอิน {group.totals.checkedIn}/{group.totals.total}</span>
                      <span>สาย {group.totals.late}</span>
                      <span>ลา {group.totals.onLeave}</span>
                      <span>ขาด {group.totals.absent}</span>
                    </div>
                  </div>
                </CardHeader>
              </summary>
              <CardContent className="border-t bg-muted/10 py-4">
                {group.employees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">ไม่พบพนักงานในกะนี้</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {group.employees.map((employee) => (
                      <Link
                        key={employee.id}
                        href={employee.employeeHref}
                        className="rounded-xl border border-border/70 bg-background px-3 py-3 transition hover:border-brand-red/30 hover:bg-brand-red/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{employee.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {[employee.department, employee.branchName].filter(Boolean).join(" • ") || "—"}
                            </p>
                          </div>
                          <Badge
                            variant={badgeVariant(employee.status)}
                            className={cn(
                              employee.status === "present" && "border-emerald-200 text-emerald-700",
                              employee.status === "pending" && "border-amber-200 text-amber-700",
                              employee.status === "upcoming" && "border-sky-200 text-sky-700"
                            )}
                          >
                            {employee.statusLabel}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{employee.note}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </details>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock3 className="size-3.5" />
        <span>วันที่ดูรายงาน: {roster.date}</span>
        {roster.goLiveDate ? <span>• go-live: {roster.goLiveDate}</span> : null}
      </div>
    </div>
  )
}
