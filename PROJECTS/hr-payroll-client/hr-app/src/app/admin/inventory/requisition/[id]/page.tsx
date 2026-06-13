import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { buttonVariants } from "@/components/ui/button"
import { getInvRequisitionDetail } from "@/features/inventory/actions/requisition"
import { RequisitionDetailView } from "@/features/inventory/RequisitionDetailView"
import { canManageHr, isDev } from "@/lib/auth/roles"
import { requireRole } from "@/lib/auth/require-role"
import { cn } from "@/lib/utils"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function RequisitionDetailPage({ params }: PageProps) {
  const employee = await requireRole(
    "employee",
    "branch_manager",
    "hr",
    "admin",
    "ceo",
    "dev"
  )
  const { id } = await params
  const detail = await getInvRequisitionDetail(id)
  if (!detail) notFound()

  const canManage = canManageHr(employee.role) || isDev(employee.role)
  const isRequester = detail.requisition.requester_id === employee.id
  const canSubmit = isRequester || canManage
  const canReceive = isRequester || canManage

  return (
    <AdminPageShell
      title="รายละเอียดใบเบิกครัว"
      description={`${detail.branch_name} → ${detail.warehouse_name}`}
      action={
        <Link
          href="/admin/inventory/requisition"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          ← รายการ
        </Link>
      }
    >
      <RequisitionDetailView
        detail={detail}
        canManage={canManage}
        canSubmit={canSubmit}
        canReceive={canReceive}
      />
    </AdminPageShell>
  )
}
