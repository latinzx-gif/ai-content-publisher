import Link from "next/link"
import { redirect } from "next/navigation"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { getInvBranches } from "@/features/inventory/actions/branch"
import { WarehouseForm } from "@/features/inventory/WarehouseForm"
import { canManageHr } from "@/lib/auth/roles"
import { requireRole } from "@/lib/auth/require-role"

export default async function NewWarehousePage() {
  const employee = await requireRole("hr", "admin", "ceo", "dev")
  if (!canManageHr(employee.role)) {
    redirect("/admin/inventory/warehouses")
  }

  const branches = (await getInvBranches()).filter((b) => b.is_active)

  return (
    <AdminPageShell
      title="สร้างคลังสินค้า"
      description={
        <Link href="/admin/inventory/warehouses" className="text-brand-red hover:underline">
          ← กลับรายการคลัง
        </Link>
      }
    >
      <WarehouseForm mode="create" branches={branches} />
    </AdminPageShell>
  )
}
