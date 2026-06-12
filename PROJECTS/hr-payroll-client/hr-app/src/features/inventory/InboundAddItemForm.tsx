"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  InventoryFormField,
  InventorySelect,
  InventoryTextInput,
} from "@/features/inventory/InventoryFormFields"
import { addInvInboundItem } from "@/features/inventory/actions/inbound"
import type { InvSku } from "@/features/inventory/types"

export function InboundAddItemForm({
  orderId,
  skus,
  disabled,
}: {
  orderId: string
  skus: InvSku[]
  disabled?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (disabled) return null

  return (
    <form
      className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
          const result = await addInvInboundItem(orderId, formData)
          if (result.success) {
            e.currentTarget.reset()
            router.refresh()
          } else {
            setError(result.error ?? "เพิ่มรายการไม่สำเร็จ")
          }
        })
      }}
    >
      <h3 className="md:col-span-2 text-sm font-semibold">เพิ่มรายการสินค้า</h3>
      <InventoryFormField label="SKU" htmlFor="sku_id">
        <InventorySelect id="sku_id" name="sku_id" required defaultValue="">
          <option value="" disabled>
            เลือก SKU
          </option>
          {skus.map((sku) => (
            <option key={sku.id} value={sku.id}>
              {sku.code} — {sku.name}
            </option>
          ))}
        </InventorySelect>
      </InventoryFormField>
      <InventoryFormField label="จำนวน" htmlFor="quantity">
        <InventoryTextInput
          id="quantity"
          name="quantity"
          type="number"
          min={0.001}
          step="any"
          required
        />
      </InventoryFormField>
      <InventoryFormField label="ต้นทุน/หน่วย (ไม่บังคับ)" htmlFor="cost_per_unit">
        <InventoryTextInput id="cost_per_unit" name="cost_per_unit" type="number" min={0} step="any" />
      </InventoryFormField>
      <InventoryFormField label="Lot (ไม่บังคับ)" htmlFor="lot_number">
        <InventoryTextInput id="lot_number" name="lot_number" />
      </InventoryFormField>
      <InventoryFormField label="วันหมดอายุ (ไม่บังคับ)" htmlFor="expiry_date">
        <InventoryTextInput id="expiry_date" name="expiry_date" type="date" />
      </InventoryFormField>
      <div className="md:col-span-2 flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "…" : "เพิ่มรายการ"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  )
}
