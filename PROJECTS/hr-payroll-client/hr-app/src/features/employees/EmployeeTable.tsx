import Link from "next/link"

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
import type { EmployeeRow } from "@/features/employees/data"

const STATUS_LABEL: Record<EmployeeRow["displayStatus"], string> = {
  active: "Active",
  probation: "Probation",
  inactive: "Inactive",
}

const STATUS_VARIANT: Record<
  EmployeeRow["displayStatus"],
  "approved" | "pending" | "neutral"
> = {
  active: "approved",
  probation: "pending",
  inactive: "neutral",
}

function formatDate(value: string | null): string {
  return value ?? "—"
}

function visaClass(visaExpiry: string | null, today: string): string {
  if (!visaExpiry) return ""
  const days =
    (new Date(visaExpiry).getTime() - new Date(today).getTime()) / 86_400_000
  return days < 30 ? "text-brand-red font-medium" : ""
}

export function EmployeeTable({
  employees,
  today,
}: {
  employees: EmployeeRow[]
  today: string
}) {
  if (employees.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        ไม่พบพนักงานตามเงื่อนไขที่เลือก
      </p>
    )
  }

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ชื่อ</TableHead>
            <TableHead>ตำแหน่ง</TableHead>
            <TableHead>แผนก</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>วันเริ่มงาน</TableHead>
            <TableHead>วีซ่าหมดอายุ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/admin/employees/${e.id}`}
                  className="text-brand-red underline-offset-4 hover:underline"
                >
                  {e.name}
                </Link>
              </TableCell>
              <TableCell>{e.position ?? "—"}</TableCell>
              <TableCell>{e.department ?? "—"}</TableCell>
              <TableCell>
                <StatusPill
                  label={STATUS_LABEL[e.displayStatus]}
                  variant={STATUS_VARIANT[e.displayStatus]}
                />
              </TableCell>
              <TableCell>{formatDate(e.contract_start)}</TableCell>
              <TableCell className={visaClass(e.visa_expiry, today)}>
                {formatDate(e.visa_expiry)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  )
}
