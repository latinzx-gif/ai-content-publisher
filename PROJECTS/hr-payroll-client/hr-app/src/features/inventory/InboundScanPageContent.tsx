"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Barcode, CheckCircle2 } from "lucide-react"
import { useCallback, useEffect, useState, useTransition } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { scanInvInboundItem } from "@/features/inventory/actions/inbound"
import { InboundBarcodeScanner } from "@/features/inventory/InboundBarcodeScanner"
import {
  initInboundScanLiff,
  isLikelyLineBrowser,
} from "@/lib/line/liff-client"
import { readInboundOrderId } from "@/lib/line/inbound-order-id"
import { cn } from "@/lib/utils"

function useInboundOrderId(pathOrderId?: string): {
  orderId: string
  resolving: boolean
} {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [orderId, setOrderId] = useState(pathOrderId?.trim() ?? "")
  const [resolving, setResolving] = useState(!pathOrderId)

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      if (pathOrderId?.trim()) {
        setOrderId(pathOrderId.trim())
        setResolving(false)
        return
      }

      const read = () =>
        readInboundOrderId(
          typeof window !== "undefined"
            ? window.location.search
            : searchParams.toString(),
          typeof window !== "undefined" ? window.location.pathname : pathname
        )

      let id =
        readInboundOrderId(searchParams.toString(), pathname) || read()

      if (!id && isLikelyLineBrowser()) {
        await initInboundScanLiff()
        id = read()
      }

      if (!cancelled) {
        setOrderId(id)
        setResolving(false)
      }
    }

    void resolve()
    return () => {
      cancelled = true
    }
  }, [pathOrderId, pathname, searchParams])

  return { orderId, resolving }
}

export function InboundScanPageContent({
  pathOrderId,
}: {
  pathOrderId?: string
}) {
  const { orderId, resolving } = useInboundOrderId(pathOrderId)
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

  const lookupBarcodeValue = useCallback(async (value: string) => {
    setError(null)
    setLookup(null)
    const trimmed = value.trim()
    if (!trimmed) return

    let res: Response
    try {
      res = await fetch(
        `/api/inventory/inbound/lookup?barcode=${encodeURIComponent(trimmed)}`
      )
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ — ตรวจอินเทอร์เน็ตแล้วกดค้นหาอีกครั้ง")
      return
    }

    const data = (await res.json().catch(() => null)) as {
      sku?: { code: string; name: string }
      error?: string
    } | null

    if (res.status === 401) {
      setError("เซสชันหมดอายุ — เปิดเมนูคลังสินค้าใน LINE ใหม่อีกครั้ง")
      return
    }
    if (!res.ok || !data?.sku) {
      setError(data?.error ?? "ไม่พบ SKU")
      return
    }
    setLookup(data.sku)
  }, [])

  const handleScanned = useCallback(
    (value: string) => {
      setBarcode(value)
      void lookupBarcodeValue(value)
    },
    [lookupBarcodeValue]
  )

  async function lookupBarcode() {
    await lookupBarcodeValue(barcode)
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
      let result: Awaited<ReturnType<typeof scanInvInboundItem>>
      try {
        result = await scanInvInboundItem({
          order_id: orderId,
          barcode: barcode.trim(),
          quantity: qty,
          lot_number: lot.trim() || null,
          expiry_date: expiry || null,
        })
      } catch {
        setError("เชื่อมต่อไม่สำเร็จ — ตรวจอินเทอร์เน็ตแล้วกดบันทึกอีกครั้ง")
        return
      }

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

  if (resolving) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-sm text-muted-foreground">
          กำลังโหลดใบรับเข้า…
        </CardContent>
      </Card>
    )
  }

  if (!orderId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>สแกนรับเข้า</CardTitle>
          <CardDescription className="leading-relaxed">
            เปิดจากเมนู <span className="font-medium">คลังสินค้า</span> แล้วกด{" "}
            <span className="font-medium">สแกน</span> ที่ใบรับเข้า — ไม่พบรหัสใบ
            (order)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/portal/inbound"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            ไปหน้าคลังสินค้า
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex w-full min-w-0 items-center gap-2">
          <Barcode className="size-5 text-brand-red" />
          สแกนรับเข้าสินค้า
        </CardTitle>
        <CardDescription>
          ใบรับเข้า: <span className="font-mono text-xs">{orderId.slice(0, 8)}…</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InboundBarcodeScanner onScanned={handleScanned} disabled={pending} />

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
