import Link from "next/link"

import { EmployeeAvatar } from "@/components/brand/EmployeeAvatar"
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
import { cn } from "@/lib/utils"

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
  if (!value) return "—"
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
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
  scrollable = false,
}: {
  employees: EmployeeRow[]
  today: string
  scrollable?: boolean
}) {
  if (employees.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        ไม่พบพนักงานตามเงื่อนไขที่เลือก
      </p>
    )
  }

  return (
    <div
      className={cn(
        "h-full rounded-xl border border-border/80 bg-background",
        scrollable && "overflow-auto"
      )}
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-12" />
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Visa Expiry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((e) => (
            <TableRow key={e.id} className="hover:bg-muted/30">
              <TableCell>
                <EmployeeAvatar name={e.name} size="sm" />
              </TableCell>
              <TableCell>
                <div className="min-w-0">
                  <Link
                    href={`/admin/employees/${e.id}`}
                    className="font-medium text-brand-red underline-offset-4 hover:underline"
                  >
                    {e.name}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">
                    ID {e.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{e.department ?? "—"}</TableCell>
              <TableCell className="text-sm">{e.position ?? "—"}</TableCell>
              <TableCell>
                <StatusPill
                  label={STATUS_LABEL[e.displayStatus]}
                  variant={STATUS_VARIANT[e.displayStatus]}
                />
              </TableCell>
              <TableCell className="text-sm tabular-nums">
                {formatDate(e.contract_start)}
              </TableCell>
              <TableCell
                className={cn("text-sm tabular-nums", visaClass(e.visa_expiry, today))}
              >
                {formatDate(e.visa_expiry)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
