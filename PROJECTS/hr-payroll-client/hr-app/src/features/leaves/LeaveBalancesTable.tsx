import Link from "next/link"

import { DataTableShell } from "@/components/brand/DataTableShell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LEAVE_TYPE_LABELS, LEAVE_TYPES } from "@/features/leave/types"
import type { EmployeeBalanceRow } from "@/features/leaves/insights"

export function LeaveBalancesTable({ rows }: { rows: EmployeeBalanceRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        ไม่มีข้อมูลยอดลา
      </p>
    )
  }

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>พนักงาน</TableHead>
            <TableHead>แผนก</TableHead>
            {LEAVE_TYPES.map((t) => (
              <TableHead key={t}>{LEAVE_TYPE_LABELS[t]}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const byType = new Map(row.balances.map((b) => [b.type, b]))
            return (
              <TableRow key={row.employeeId}>
                <TableCell>
                  <Link
                    href={`/admin/employees/${row.employeeId}`}
                    className="font-medium text-brand-red underline-offset-4 hover:underline"
                  >
                    {row.employeeName}
                  </Link>
                </TableCell>
                <TableCell>{row.department ?? "—"}</TableCell>
                {LEAVE_TYPES.map((t) => {
                  const b = byType.get(t)
                  return (
                    <TableCell key={t} className="text-sm tabular-nums">
                      {b ? (
                        <>
                          {b.remaining}
                          <span className="text-muted-foreground">
                            {" "}
                            / {b.total}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </DataTableShell>
  )
}
