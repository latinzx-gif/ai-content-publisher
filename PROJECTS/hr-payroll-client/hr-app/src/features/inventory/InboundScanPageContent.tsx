"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Tabs } from "@base-ui/react/tabs"
import { Barcode, CheckCircle2, Trash2 } from "lucide-react"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  deleteMobileInvInboundItem,
  listMobileInvInboundItems,
  scanInvInboundItem,
} from "@/features/inventory/actions/inbound"
import { InboundBarcodeScanner } from "@/features/inventory/InboundBarcodeScanner"
import type { InvInboundItemRow } from "@/features/inventory/types"
import {
  initInboundScanLiff,
  isLikelyLineBrowser,
} from "@/lib/line/liff-client"
import { readInboundOrderId } from "@/lib/line/inbound-order-id"
import { cn } from "@/lib/utils"

type LookupSku = { code: string; name: string }

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
  const searchParams = useSearchParams()
  const { orderId, resolving } = useInboundOrderId(pathOrderId)
  const quantityRef = useRef<HTMLInputElement | null>(null)
  const [barcode, setBarcode] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [lot, setLot] = useState("")
  const [expiry, setExpiry] = useState("")
  const [lookup, setLookup] = useState<LookupSku | null>(null)
  const [quickSave, setQuickSave] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageVisible, setMessageVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<InvInboundItemRow[]>([])
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [loadingItems, setLoadingItems] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const loadItems = useCallback(async () => {
    if (!orderId) return
    setLoadingItems(true)
    setItemsError(null)
    try {
      const result = await listMobileInvInboundItems(orderId)
      if (result.success) {
        setItems(result.items ?? [])
      } else {
        setItemsError(result.error ?? "โหลดรายการไม่สำเร็จ")
      }
    } catch {
      setItemsError("เชื่อมต่อไม่สำเร็จ — โหลดรายการไม่สำเร็จ")
    } finally {
      setLoadingItems(false)
    }
  }, [orderId])

  const showMessage = useCallback((text: string) => {
    setMessage(text)
    setMessageVisible(true)
  }, [])

  const lookupBarcodeValue = useCallback(async (value: string) => {
    setError(null)
    setLookup(null)
    const trimmed = value.trim()
    if (!trimmed) return null

    let res: Response
    try {
      res = await fetch(
        `/api/inventory/inbound/lookup?barcode=${encodeURIComponent(trimmed)}`
      )
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ — ตรวจอินเทอร์เน็ตแล้วกดค้นหาอีกครั้ง")
      return null
    }

    const data = (await res.json().catch(() => null)) as {
      sku?: LookupSku
      error?: string
    } | null

    if (res.status === 401) {
      setError("เซสชันหมดอายุ — เปิดเมนูคลังสินค้าใน LINE ใหม่อีกครั้ง")
      return null
    }
    if (!res.ok || !data?.sku) {
      setError(data?.error ?? "ไม่พบ SKU")
      return null
    }
    setLookup(data.sku)
    return data.sku
  }, [])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  useEffect(() => {
    if (!message) return
    const fadeTimeout = window.setTimeout(() => {
      setMessageVisible(false)
    }, 1700)
    const clearTimeout = window.setTimeout(() => {
      setMessage(null)
    }, 2000)
    return () => {
      window.clearTimeout(fadeTimeout)
      window.clearTimeout(clearTimeout)
    }
  }, [message])

  const submit = useCallback(
    (override?: { barcode?: string; quantity?: string; skuCode?: string }) => {
      setMessage(null)
      setMessageVisible(false)
      setError(null)

      if (!orderId) {
        setError("ไม่พบรหัสใบรับเข้า (order)")
        return
      }

      const nextBarcode = override?.barcode ?? barcode
      const nextQuantity = override?.quantity ?? quantity
      const qty = Number(nextQuantity)
      if (!Number.isFinite(qty) || qty <= 0) {
        setError("จำนวนไม่ถูกต้อง")
        return
      }

      startTransition(async () => {
        let result: Awaited<ReturnType<typeof scanInvInboundItem>>
        try {
          result = await scanInvInboundItem({
            order_id: orderId,
            barcode: nextBarcode.trim(),
            quantity: qty,
            lot_number: lot.trim() || null,
            expiry_date: expiry || null,
          })
        } catch {
          setError("เชื่อมต่อไม่สำเร็จ — ตรวจอินเทอร์เน็ตแล้วกดบันทึกอีกครั้ง")
          return
        }

        if (result.success) {
          showMessage(
            `บันทึก ${override?.skuCode ?? lookup?.code ?? nextBarcode} แล้ว`
          )
          setBarcode("")
          setQuantity("1")
          setLot("")
          setExpiry("")
          setLookup(null)
          await loadItems()
        } else {
          setError(result.error ?? "บันทึกไม่สำเร็จ")
        }
      })
    },
    [
      barcode,
      expiry,
      loadItems,
      lookup?.code,
      lot,
      orderId,
      quantity,
      showMessage,
    ]
  )

  const handleScanned = useCallback(
    (value: string) => {
      setBarcode(value)
      void (async () => {
        const sku = await lookupBarcodeValue(value)
        if (sku && quickSave && Number(quantity) === 1) {
          submit({ barcode: value, quantity: "1", skuCode: sku.code })
          return
        }
        window.requestAnimationFrame(() => quantityRef.current?.focus())
      })()
    },
    [lookupBarcodeValue, quantity, quickSave, submit]
  )

  useEffect(() => {
    const value = searchParams.get("barcode")?.trim()
    if (!value) return
    handleScanned(value)
  }, [handleScanned, searchParams])

  async function lookupBarcode() {
    await lookupBarcodeValue(barcode)
  }

  async function deleteItem(item: InvInboundItemRow) {
    if (!window.confirm(`ลบรายการ ${item.sku_code} จำนวน ${item.quantity}?`)) {
      return
    }

    setDeletingId(item.id)
    setError(null)
    setMessage(null)
    setMessageVisible(false)
    try {
      const result = await deleteMobileInvInboundItem(item.id, orderId)
      if (result.success) {
        showMessage(`ลบ ${item.sku_code} แล้ว`)
        await loadItems()
      } else {
        setError(result.error ?? "ลบรายการไม่สำเร็จ")
      }
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ — ลบรายการไม่สำเร็จ")
    } finally {
      setDeletingId(null)
    }
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
        {message ? (
          <div
            className={cn(
              "fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 mx-auto flex max-w-sm items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-opacity duration-300",
              messageVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <CheckCircle2 className="size-4" />
            {message}
          </div>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Tabs.Root defaultValue="scan" className="space-y-4">
          <Tabs.List className="grid grid-cols-2 rounded-lg bg-muted p-1">
            <Tabs.Tab
              value="scan"
              className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm"
            >
              สแกน
            </Tabs.Tab>
            <Tabs.Tab
              value="items"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm"
            >
              รายการ
              <Badge variant="secondary">{items.length}</Badge>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="scan" keepMounted className="space-y-4">
            <InboundBarcodeScanner onScanned={handleScanned} disabled={pending} />

            <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-primary"
                checked={quickSave}
                onChange={(event) => setQuickSave(event.target.checked)}
              />
              บันทึกทันทีที่สแกน (จำนวน 1)
            </label>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="barcode">
                Barcode
              </label>
              <div className="flex gap-2">
                <input
                  id="barcode"
                  className="h-10 flex-1 rounded-lg border border-input px-3 text-sm"
                  value={barcode}
                  onChange={(event) => setBarcode(event.target.value)}
                  onBlur={() => void lookupBarcode()}
                  placeholder="สแกนหรือพิมพ์ barcode"
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void lookupBarcode()}
                >
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
                  ref={quantityRef}
                  type="number"
                  min={0.001}
                  step="any"
                  className="h-10 w-full rounded-lg border border-input px-3 text-sm"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
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
                  onChange={(event) => setLot(event.target.value)}
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
                onChange={(event) => setExpiry(event.target.value)}
              />
            </div>

            <Button className="w-full" disabled={pending} onClick={() => submit()}>
              {pending ? "กำลังบันทึก…" : "บันทึกรายการ"}
            </Button>
          </Tabs.Panel>

          <Tabs.Panel value="items" keepMounted className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">รายการที่บันทึกแล้ว</p>
                <p className="text-xs text-muted-foreground">
                  ลบได้ก่อน Inventory อนุมัติ
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loadingItems}
                onClick={() => void loadItems()}
              >
                รีเฟรช
              </Button>
            </div>

            {itemsError ? (
              <p className="text-sm text-destructive">{itemsError}</p>
            ) : null}
            {loadingItems && items.length === 0 ? (
              <p className="text-sm text-muted-foreground">กำลังโหลดรายการ…</p>
            ) : null}
            {!loadingItems && items.length === 0 && !itemsError ? (
              <p className="text-sm text-muted-foreground">
                ยังไม่มีรายการ — ถ่ายรูป barcode แล้วบันทึกได้เลย
              </p>
            ) : null}

            {items.length > 0 ? (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.sku_code} — {item.sku_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        จำนวน {item.quantity}
                        {item.lot_number ? ` · Lot ${item.lot_number}` : ""}
                        {item.expiry_date ? ` · Exp ${item.expiry_date}` : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-destructive"
                      disabled={deletingId === item.id}
                      onClick={() => void deleteItem(item)}
                    >
                      <Trash2 className="size-4" />
                      ลบ
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </Tabs.Panel>
        </Tabs.Root>
      </CardContent>
    </Card>
  )
}
