import { Package } from "lucide-react"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { DevelopmentEmptyState } from "@/components/brand/DevelopmentEmptyState"

export default function AdminInventoryPage() {
  return (
    <AdminPageShell
      title="Inventory"
      description="จัดการสต็อกและทรัพย์สินขององค์กร"
    >
      <DevelopmentEmptyState icon={Package} title="Inventory" />
    </AdminPageShell>
  )
}
