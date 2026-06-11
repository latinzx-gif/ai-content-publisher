import Link from "next/link"
import { UserPlus } from "lucide-react"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { CountBadge } from "@/components/brand/CountBadge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getDepartments,
  getEmployees,
  normalizeParams,
  PAGE_SIZE,
} from "@/features/employees/data"
import { EmployeeFilters } from "@/features/employees/EmployeeFilters"
import { EmployeePagination } from "@/features/employees/EmployeePagination"
import { EmployeeTable } from "@/features/employees/EmployeeTable"

export default async function AdminEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = normalizeParams(await searchParams)
  const [{ employees, total, today }, departments] = await Promise.all([
    getEmployees(params),
    getDepartments(),
  ])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <AdminPageShell
        fill
        title="Employees"
        description="รายชื่อพนักงาน — ค้นหา กรอง และเปิดโปรไฟล์"
        badge={<CountBadge count={total} label="คน" />}
        action={
          <Link
            href="/admin/employees/new"
            className={cn(
              buttonVariants({ size: "default" }),
              "bg-brand-red text-white hover:bg-brand-red/90"
            )}
          >
            <UserPlus className="size-4" />
            Add Employee
          </Link>
        }
      >
        <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
          <EmployeeFilters departments={departments} />
          <div className="min-h-0 flex-1 overflow-hidden">
            <EmployeeTable employees={employees} today={today} scrollable />
          </div>
          <EmployeePagination
            page={params.page}
            total={total}
            pageSize={PAGE_SIZE}
          />
        </div>
      </AdminPageShell>
    </div>
  )
}
