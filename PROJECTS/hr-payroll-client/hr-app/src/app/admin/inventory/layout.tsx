import { InventorySubNav } from "@/features/inventory/InventorySubNav"
import { isInventoryPortalUser } from "@/lib/auth/roles"
import { requireInventoryPortal } from "@/lib/auth/require-inventory-portal"

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const employee = await requireInventoryPortal()
  const staffMode = isInventoryPortalUser(employee)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <InventorySubNav staffMode={staffMode} />
      {children}
    </div>
  )
}
