import Link from "next/link"
import { Barcode, ExternalLink } from "lucide-react"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { buttonVariants } from "@/components/ui/button"
import { listInvInboundOrders } from "@/features/inventory/inbound-data"
import { getCurrentEmployee } from "@/lib/auth/session"
import { formatThaiDate } from "@/lib/datetime/thailand"
import { cn } from "@/lib/utils"

export default async function PortalInboundPage() {
  const employee = await getCurrentEmployee()
  if (!employee) return null

  let loadError: string | null = null
  let orders: Awaited<ReturnType<typeof listInvInboundOrders>> = []

  try {
    orders = await listInvInboundOrders({ status: "pending" })
  } catch (error) {
    loadError = error instanceof Error ? error.message : "โหลดใบรับเข้าไม่สำเร็จ"
  }

  return (
    <AdminPageShell
      title="คลังสินค้า"
      description="เลือกใบรับเข้าที่รอสแกน barcode แล้วเปิดหน้าสแกน"
    >
      {loadError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      {orders.length === 0 && !loadError ? (
        <div className="rounded-xl border border-border/80 bg-muted/20 px-4 py-10 text-center">
          <Barcode className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">ไม่มีใบรับเข้ารอสแกน</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ติดต่อ HR เมื่อมีสินค้าเข้า — HR จะส่งใบรับเข้าให้สแกน
          </p>
        </div>
      ) : null}

      {orders.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium">
                  {order.supplier_name} → {order.warehouse_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  สร้าง {formatThaiDate(order.created_at)}
                  {order.item_count > 0
                    ? ` · ${order.item_count} รายการแล้ว`
                    : " · ยังไม่มีรายการ"}
                </p>
                {order.notes ? (
                  <p className="text-xs text-muted-foreground">{order.notes}</p>
                ) : null}
              </div>
              <Link
                href={`/liff/inbound-scan?order=${order.id}`}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "inline-flex shrink-0 items-center gap-1.5"
                )}
              >
                สแกน
                <ExternalLink className="size-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </AdminPageShell>
  )
}
