import Link from "next/link"
import { BarChart3, Building2, Package, PackagePlus, Truck, Warehouse } from "lucide-react"

import { WidgetCard } from "@/components/brand/WidgetCard"

const SECTIONS = [
  {
    title: "รับเข้าสินค้า",
    description: "Inbound — สร้างใบ → คลังสแกน → Inventory อนุมัติเพิ่มสต็อก",
    href: "/admin/inventory/inbound",
    icon: PackagePlus,
  },
  {
    title: "สต็อกคงเหลือ",
    description: "ยอดตาม SKU และคลัง — กรองต่ำกว่า Min",
    href: "/admin/inventory/stock",
    icon: BarChart3,
  },
  {
    title: "SKU / วัตถุดิบ",
    description: "รหัสสินค้า Barcode หน่วย Min/Max",
    href: "/admin/inventory/sku",
    icon: Package,
  },
  {
    title: "Supplier",
    description: "ผู้จัดจำหน่ายและข้อมูลติดต่อ",
    href: "/admin/inventory/suppliers",
    icon: Truck,
  },
  {
    title: "สาขา (คลัง)",
    description: "สาขาร้านสำหรับระบบคลัง (แยกจาก HR)",
    href: "/admin/inventory/branches",
    icon: Building2,
  },
  {
    title: "คลังสินค้า",
    description: "Main/Sub warehouse ต่อสาขา",
    href: "/admin/inventory/warehouses",
    icon: Warehouse,
  },
] as const

export function InventoryHub() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SECTIONS.map((section) => {
        const Icon = section.icon
        return (
          <Link key={section.href} href={section.href} className="block h-full">
            <WidgetCard title={section.title} compact>
              <div className="space-y-2 p-3">
                <Icon className="size-8 text-brand-red" aria-hidden />
                <p className="text-sm text-muted-foreground">{section.description}</p>
                <span className="text-sm font-medium text-brand-red hover:underline">
                  จัดการ →
                </span>
              </div>
            </WidgetCard>
          </Link>
        )
      })}
    </div>
  )
}
