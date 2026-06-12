import Link from "next/link"
import { redirect } from "next/navigation"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { BranchForm } from "@/features/inventory/BranchForm"
import { canManageHr } from "@/lib/auth/roles"
import { requireRole } from "@/lib/auth/require-role"

export default async function NewBranchPage() {
  const employee = await requireRole("hr", "admin", "ceo", "dev")
  if (!canManageHr(employee.role)) {
    redirect("/admin/inventory/branches")
  }

  return (
    <AdminPageShell
      title="สร้างสาขา (คลัง)"
      description={
        <Link href="/admin/inventory/branches" className="text-brand-red hover:underline">
          ← กลับรายการสาขา
        </Link>
      }
    >
      <BranchForm mode="create" />
    </AdminPageShell>
  )
}
