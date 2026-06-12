import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { DepartmentManager } from "@/features/organization/DepartmentManager"
import { getDepartments } from "@/features/organization/data"
import { canManageHr } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function AdminOrganizationPage() {
  const employee = await getCurrentEmployee()
  const canManage = employee ? canManageHr(employee.role) : false
  const rows = await getDepartments()

  return (
    <AdminPageShell
      title="Organization"
      description="จัดการแผนกและโครงสร้างองค์กร"
    >
      <DepartmentManager rows={rows} canManage={canManage} />
    </AdminPageShell>
  )
}
