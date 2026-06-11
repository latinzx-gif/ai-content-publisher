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
import type { AnnouncementRow } from "@/features/announcements/data"

export function AnnouncementTable({ rows }: { rows: AnnouncementRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        ยังไม่มีประกาศ
      </p>
    )
  }

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>หัวข้อ</TableHead>
            <TableHead>กลุ่มเป้าหมาย</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>วันที่</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="font-medium">{row.title}</div>
                <div className="max-w-[320px] truncate text-xs text-muted-foreground">
                  {row.body}
                </div>
              </TableCell>
              <TableCell>
                {row.targetType === "all"
                  ? "ทุกคน"
                  : `แผนก: ${row.targetValue ?? "—"}`}
              </TableCell>
              <TableCell>
                <StatusPill
                  label={row.status === "sent" ? "ส่งแล้ว" : "แบบร่าง"}
                  variant={row.status === "sent" ? "approved" : "pending"}
                />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(row.sentAt ?? row.createdAt).toLocaleString("th-TH")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  )
}
