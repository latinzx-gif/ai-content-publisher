"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { ComplaintRow } from "@/features/complaints/data"

export function ComplaintReplyActions({ complaint }: { complaint: ComplaintRow }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (complaint.status === "closed") {
    return <span className="text-xs text-muted-foreground">ปิดเรื่องแล้ว</span>
  }

  async function submit(close: boolean) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, close }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "ส่งคำตอบไม่สำเร็จ")
      }
      setMessage("")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งคำตอบไม่สำเร็จ")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-w-[180px] flex-col gap-2">
      <textarea
        className="min-h-[60px] rounded-lg border border-input px-2 py-1 text-xs"
        placeholder="ข้อความตอบกลับ"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" disabled={busy} onClick={() => submit(false)}>
          ตอบกลับ
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => submit(true)}>
          ปิดเรื่อง
        </Button>
      </div>
      {complaint.isAnonymous ? (
        <p className="text-xs text-muted-foreground">ไม่แจ้ง LINE (นิรนาม)</p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
