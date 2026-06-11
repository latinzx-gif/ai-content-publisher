import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { CountBadge } from "@/components/brand/CountBadge"
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
    <AdminPageShell
      title="Employees"
      description="รายชื่อพนักงานทั้งหมด — ค้นหา กรอง และเปิดโปรไฟล์"
      badge={<CountBadge count={total} label="คน" />}
    >
      <div className="flex flex-col gap-4">
        <EmployeeFilters departments={departments} />
        <EmployeeTable employees={employees} today={today} />
        <EmployeePagination
          page={params.page}
          total={total}
          pageSize={PAGE_SIZE}
        />
      </div>
    </AdminPageShell>
  )
}
