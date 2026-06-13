import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { buttonVariants } from "@/components/ui/button"
import { getDamageReportDetail } from "@/features/inventory/actions/consumption"
import { DamageDetailView } from "@/features/inventory/DamageDetailView"
import { canManageHr, isDev } from "@/lib/auth/roles"
import { requireRole } from "@/lib/auth/require-role"
import { cn } from "@/lib/utils"

type PageProps = {
  params: Promise<{ id: string }>
}

function canApproveAdmin(role: Parameters<typeof canManageHr>[0]) {
  return role === "admin" || isDev(role)
}

export default async function DamageDetailPage({ params }: PageProps) {
  const employee = await requireRole(
    "employee",
    "branch_manager",
    "hr",
    "admin",
    "ceo",
    "dev"
  )
  const { id } = await params
  const detail = await getDamageReportDetail(id)
  if (!detail) notFound()

  const canApproveNormal = canManageHr(employee.role) || isDev(employee.role)
  const canDecide =
    detail.approval_required_role === "admin"
      ? canApproveAdmin(employee.role)
      : canApproveNormal

  return (
    <AdminPageShell
      title="รายละเอียดความเสียหาย"
      description={`${detail.sku_code} — ${detail.sku_name}`}
      action={
        <Link
          href="/admin/inventory/damage"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          ← รายการ
        </Link>
      }
    >
      <DamageDetailView
        detail={detail}
        canApprove={canDecide}
        canReject={canDecide}
      />
    </AdminPageShell>
  )
}
