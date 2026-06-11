"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DOC_STATUSES,
  DOC_STATUS_LABELS,
  type DocStatus,
} from "@/features/documents/types"
import type { DocumentRequestRow } from "@/features/documents/data"

const NEXT_STATUS: Partial<Record<DocStatus, DocStatus>> = {
  pending: "processing",
  processing: "ready",
  ready: "completed",
}

export function DocumentDecisionActions({ doc }: { doc: DocumentRequestRow }) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = NEXT_STATUS[doc.status]

  if (!next) {
    return (
      <span className="text-xs text-muted-foreground">
        {doc.hrNote ?? "—"}
      </span>
    )
  }

  async function advance(status: DocStatus) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/documents/${doc.id}/decide`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, note }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "ดำเนินการไม่สำเร็จ")
      }
      setNote("")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-w-[160px] flex-col gap-2">
      <textarea
        className="min-h-[50px] rounded-lg border border-input px-2 py-1 text-xs"
        placeholder="หมายเหตุ (ไม่บังคับ)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button size="sm" disabled={busy} onClick={() => advance(next)}>
        {busy ? "…" : `→ ${DOC_STATUS_LABELS[next]}`}
      </Button>
      {doc.status !== "pending" ? (
        <select
          className="rounded border border-input px-1 py-1 text-xs"
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value as DocStatus
            if (DOC_STATUSES.includes(v)) void advance(v)
          }}
        >
          <option value="" disabled>
            เปลี่ยนสถานะ…
          </option>
          {DOC_STATUSES.filter((s) => s !== doc.status).map((s) => (
            <option key={s} value={s}>
              {DOC_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
