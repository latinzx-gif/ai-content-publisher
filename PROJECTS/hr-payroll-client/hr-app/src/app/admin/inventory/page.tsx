import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { InventoryHub } from "@/features/inventory/InventoryHub"

export default function AdminInventoryPage() {
  return (
    <AdminPageShell
      title="คลังสินค้า"
      description="ข้อมูลหลัก — SKU Supplier สาขาและคลัง (Phase 1)"
    >
      <InventoryHub />
    </AdminPageShell>
  )
}
