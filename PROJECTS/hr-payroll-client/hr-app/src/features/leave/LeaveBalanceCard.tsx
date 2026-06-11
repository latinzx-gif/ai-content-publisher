import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LEAVE_TYPE_LABELS, LEAVE_TYPES } from "@/features/leave/types"

export type LeaveBalance = {
  leave_type: string
  total_days: number
  used_days: number
}

// Balances come from hr_leave_balances via the caller's session (RLS
// self-select). A type with no row means HR hasn't set a quota yet —
// shown as "ยังไม่กำหนด", not 0, to avoid implying no days remain.
export function LeaveBalanceCard({ balances }: { balances: LeaveBalance[] }) {
  const byType = new Map(balances.map((b) => [b.leave_type, b]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>วันลาคงเหลือ</CardTitle>
        <CardDescription>ยอดคงเหลือต่อประเภทการลา</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3">
          {LEAVE_TYPES.map((type) => {
            const balance = byType.get(type)
            const remaining = balance
              ? balance.total_days - balance.used_days
              : null
            return (
              <div key={type} className="rounded-lg bg-muted/50 p-3">
                <dt className="text-xs text-muted-foreground">
                  {LEAVE_TYPE_LABELS[type]}
                </dt>
                <dd className="mt-1 text-lg font-medium tabular-nums">
                  {remaining === null ? (
                    <span className="text-sm font-normal text-muted-foreground">
                      ยังไม่กำหนด
                    </span>
                  ) : (
                    <>
                      {remaining}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        / {balance!.total_days} วัน
                      </span>
                    </>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      </CardContent>
    </Card>
  )
}
