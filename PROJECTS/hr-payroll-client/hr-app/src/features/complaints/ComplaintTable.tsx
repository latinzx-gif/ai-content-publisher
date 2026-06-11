import { DataTableShell } from "@/components/brand/DataTableShell"
import { StatusPill } from "@/components/brand/StatusPill"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { COMPLAINT_STATUS_LABELS } from "@/features/complaints/types"
import { ComplaintReplyActions } from "@/features/complaints/ComplaintReplyActions"
import type { ComplaintRow } from "@/features/complaints/data"

const STATUS_VARIANT = {
  open: "pending",
  replied: "approved",
  closed: "rejected",
} as const

export function ComplaintTable({ rows }: { rows: ComplaintRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        ไม่พบเรื่องร้องเรียน
      </p>
    )
  }

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>เลขที่</TableHead>
            <TableHead>หัวข้อ</TableHead>
            <TableHead>ผู้แจ้ง</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>ดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-xs">{row.ticketCode}</TableCell>
              <TableCell>
                <div className="font-medium">{row.subject}</div>
                <div className="max-w-[240px] truncate text-xs text-muted-foreground">
                  {row.body}
                </div>
              </TableCell>
              <TableCell>
                {row.isAnonymous ? (
                  <span className="text-xs text-muted-foreground">นิรนาม</span>
                ) : (
                  <>
                    <div>{row.employeeName}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.department ?? "—"}
                    </div>
                  </>
                )}
              </TableCell>
              <TableCell>
                <StatusPill
                  label={COMPLAINT_STATUS_LABELS[row.status]}
                  variant={STATUS_VARIANT[row.status]}
                />
              </TableCell>
              <TableCell>
                <ComplaintReplyActions complaint={row} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  )
}
