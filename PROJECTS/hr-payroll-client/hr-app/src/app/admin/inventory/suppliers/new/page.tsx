import Link from "next/link"
import { redirect } from "next/navigation"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { SupplierForm } from "@/features/inventory/SupplierForm"
import { canManageHr } from "@/lib/auth/roles"
import { requireRole } from "@/lib/auth/require-role"

export default async function NewSupplierPage() {
  const employee = await requireRole("hr", "admin", "ceo", "dev")
  if (!canManageHr(employee.role)) {
    redirect("/admin/inventory/suppliers")
  }

  return (
    <AdminPageShell
      title="สร้าง Supplier"
      description={
        <Link href="/admin/inventory/suppliers" className="text-brand-red hover:underline">
          ← กลับรายการ Supplier
        </Link>
      }
    >
      <SupplierForm mode="create" />
    </AdminPageShell>
  )
}
