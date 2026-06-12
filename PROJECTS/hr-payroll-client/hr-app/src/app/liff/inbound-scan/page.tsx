"use client"

import { Suspense, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { Barcode, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { scanInvInboundItem } from "@/features/inventory/actions/inbound"

function InboundScanForm() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order") ?? ""
  const [barcode, setBarcode] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [lot, setLot] = useState("")
  const [expiry, setExpiry] = useState("")
  const [lookup, setLookup] = useState<{ code: string; name: string } | null>(
    null
  )
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function lookupBarcode() {
    setError(null)
    setLookup(null)
    const trimmed = barcode.trim()
    if (!trimmed) return

    const res = await fetch(
      `/api/inventory/inbound/lookup?barcode=${encodeURIComponent(trimmed)}`
    )
    const data = (await res.json().catch(() => null)) as {
      sku?: { code: string; name: string }
      error?: string
    } | null

    if (!res.ok || !data?.sku) {
      setError(data?.error ?? "ไม่พบ SKU")
      return
    }
    setLookup(data.sku)
  }

  function submit() {
    setMessage(null)
    setError(null)

    if (!orderId) {
      setError("ไม่พบรหัสใบรับเข้า (order)")
      return
    }

    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("จำนวนไม่ถูกต้อง")
      return
    }

    startTransition(async () => {
      const result = await scanInvInboundItem({
        order_id: orderId,
        barcode: barcode.trim(),
        quantity: qty,
        lot_number: lot.trim() || null,
        expiry_date: expiry || null,
      })

      if (result.success) {
        setMessage(`บันทึก ${lookup?.code ?? barcode} จำนวน ${qty} แล้ว`)
        setBarcode("")
        setQuantity("1")
        setLot("")
        setExpiry("")
        setLookup(null)
      } else {
        setError(result.error ?? "บันทึกไม่สำเร็จ")
      }
    })
  }

  if (!orderId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>สแกนรับเข้า</CardTitle>
          <CardDescription>เปิดลิงก์จากใบรับเข้าในระบบ HR (มี ?order=...)</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Barcode className="size-5 text-brand-red" />
          สแกนรับเข้าสินค้า
        </CardTitle>
        <CardDescription>
          ใบรับเข้า: <span className="font-mono text-xs">{orderId.slice(0, 8)}…</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="barcode">
            Barcode
          </label>
          <div className="flex gap-2">
            <input
              id="barcode"
              className="h-10 flex-1 rounded-lg border border-input px-3 text-sm"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onBlur={() => void lookupBarcode()}
              placeholder="สแกนหรือพิมพ์ barcode"
              autoComplete="off"
            />
            <Button type="button" variant="outline" onClick={() => void lookupBarcode()}>
              ค้นหา
            </Button>
          </div>
          {lookup ? (
            <p className="text-sm text-muted-foreground">
              {lookup.code} — {lookup.name}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="qty">
              จำนวน
            </label>
            <input
              id="qty"
              type="number"
              min={0.001}
              step="any"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="lot">
              Lot
            </label>
            <input
              id="lot"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm"
              value={lot}
              onChange={(e) => setLot(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="expiry">
            วันหมดอายุ
          </label>
          <input
            id="expiry"
            type="date"
            className="h-10 w-full rounded-lg border border-input px-3 text-sm"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
        </div>

        <Button className="w-full" disabled={pending} onClick={submit}>
          {pending ? "กำลังบันทึก…" : "บันทึกรายการ"}
        </Button>

        {message ? (
          <p className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="size-4" />
            {message}
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  )
}

export default function InboundScanPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-background p-4">
      <Suspense fallback={<p className="text-sm text-muted-foreground">กำลังโหลด…</p>}>
        <InboundScanForm />
      </Suspense>
    </main>
  )
}
