import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { InventoryHub } from "@/features/inventory/InventoryHub"
import { isInventoryPortalUser } from "@/lib/auth/roles"
import { requireInventoryPortal } from "@/lib/auth/require-inventory-portal"

export default async function AdminInventoryPage() {
  const employee = await requireInventoryPortal()
  const staffMode = isInventoryPortalUser(employee)

  return (
    <AdminPageShell
      title="คลังสินค้า"
      description={
        staffMode
          ? "งานคลังสินค้า — รับเข้า สต็อก ใบเบิก และแจ้งเตือน"
          : "ข้อมูลหลัก — SKU Supplier สาขาและคลัง (Phase 1)"
      }
    >
      <InventoryHub staffMode={staffMode} />
    </AdminPageShell>
  )
}
