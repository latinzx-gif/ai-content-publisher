import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { DataTableShell } from "@/components/brand/DataTableShell"
import { StatusPill } from "@/components/brand/StatusPill"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteInvInboundItem } from "@/features/inventory/actions/inbound"
import { getInvSkus } from "@/features/inventory/actions/sku"
import {
  getInvInboundOrderDetail,
  INBOUND_STATUS_LABELS,
} from "@/features/inventory/inbound-data"
import { InboundAddItemForm } from "@/features/inventory/InboundAddItemForm"
import { InboundOrderActions } from "@/features/inventory/InboundOrderActions"
import { InventoryDeleteButton } from "@/features/inventory/InventoryDeleteButton"
import type { InvInboundStatus } from "@/features/inventory/types"
import { formatThaiDate } from "@/lib/datetime/thailand"
import { canManageHr, isCeo, isDev } from "@/lib/auth/roles"
import { requireRole } from "@/lib/auth/require-role"
import { cn } from "@/lib/utils"

function statusVariant(status: InvInboundStatus) {
  if (status === "approved") return "approved" as const
  if (status === "pending") return "pending" as const
  return "neutral" as const
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function InboundOrderDetailPage({ params }: PageProps) {
  const employee = await requireRole("hr", "admin", "ceo", "dev")
  const canManage = canManageHr(employee.role)
  const readOnly = isCeo(employee.role) && !isDev(employee.role)

  const { id } = await params
  const detail = await getInvInboundOrderDetail(id)
  if (!detail) notFound()

  const { order, supplier_name, warehouse_name, items } = detail
  const editable = canManage && (order.status === "draft" || order.status === "pending")

  const skus =
    editable ? (await getInvSkus()).filter((s) => s.is_active) : []

  return (
    <AdminPageShell
      title="รายละเอียดใบรับเข้า"
      description={`${supplier_name} → ${warehouse_name}`}
      action={
        <Link
          href="/admin/inventory/inbound"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          ← รายการ
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusPill
          label={INBOUND_STATUS_LABELS[order.status]}
          variant={statusVariant(order.status)}
        />
        <span className="text-sm text-muted-foreground">
          สร้าง {formatThaiDate(order.created_at)}
          {order.received_date
            ? ` · รับเข้า ${formatThaiDate(order.received_date)}`
            : ""}
        </span>
        <InboundOrderActions
          orderId={order.id}
          status={order.status}
          canManage={canManage && !readOnly}
        />
      </div>

      {order.notes ? (
        <p className="mb-4 text-sm text-muted-foreground">{order.notes}</p>
      ) : null}

      <DataTableShell>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>จำนวน</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>หมดอายุ</TableHead>
              {editable ? <TableHead className="text-right">ลบ</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku_code}</TableCell>
                  <TableCell>{item.sku_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.lot_number || "—"}</TableCell>
                  <TableCell>
                    {item.expiry_date ? formatThaiDate(item.expiry_date) : "—"}
                  </TableCell>
                  {editable ? (
                    <TableCell className="text-right">
                      <InventoryDeleteButton
                        label={`รายการ ${item.sku_code}`}
                        onDelete={() => deleteInvInboundItem(item.id, order.id)}
                      />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={editable ? 6 : 5}
                  className="py-8 text-center text-muted-foreground"
                >
                  ยังไม่มีรายการ — ให้คลังสแกน LIFF หรือ HR เพิ่มด้านล่าง
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DataTableShell>

      {editable ? (
        <div className="mt-4">
          <InboundAddItemForm orderId={order.id} skus={skus} />
        </div>
      ) : null}

      {order.status === "pending" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          เปิดรับสแกน — คลังสแกน barcode ได้ที่{" "}
          <a
            href={`/liff/inbound-scan?order=${order.id}`}
            className="font-medium text-brand-red underline"
            target="_blank"
            rel="noreferrer"
          >
            LIFF รับเข้า
          </a>
          {" "}หรือ Portal → คลังสินค้า · HR อนุมัติหลังตรวจรายการครบ
        </p>
      ) : null}
    </AdminPageShell>
  )
}
