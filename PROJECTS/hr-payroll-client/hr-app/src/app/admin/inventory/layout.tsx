import { InventorySubNav } from "@/features/inventory/InventorySubNav"
import { requireRole } from "@/lib/auth/require-role"

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("hr", "admin", "ceo", "dev")

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <InventorySubNav />
      {children}
    </div>
  )
}
