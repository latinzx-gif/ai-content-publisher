import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { DepartmentManager } from "@/features/organization/DepartmentManager"
import { getDepartments } from "@/features/organization/data"

export default async function AdminOrganizationPage() {
  const rows = await getDepartments()

  return (
    <AdminPageShell
      title="Organization"
      description="จัดการแผนกและโครงสร้างองค์กร"
    >
      <DepartmentManager rows={rows} />
    </AdminPageShell>
  )
}
