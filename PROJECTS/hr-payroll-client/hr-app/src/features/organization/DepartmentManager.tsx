"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { DepartmentRow } from "@/features/organization/data"

export function DepartmentManager({
  rows,
  canManage = false,
}: {
  rows: DepartmentRow[]
  canManage?: boolean
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addDepartment() {
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "เพิ่มแผนกไม่สำเร็จ")
      }
      setName("")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "เพิ่มแผนกไม่สำเร็จ")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <div className="flex gap-2">
          <input
            className="h-9 flex-1 rounded-lg border border-input px-3 text-sm"
            placeholder="ชื่อแผนกใหม่"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button size="sm" disabled={busy} onClick={addDepartment}>
            เพิ่มแผนก
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          ดูรายชื่อแผนกได้อย่างเดียว — ต้องใช้บัญชี HR/Admin ในการเพิ่มแผนก
        </p>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="divide-y rounded-xl border">
        {rows.length === 0 ? (
          <li className="p-4 text-sm text-muted-foreground">ยังไม่มีแผนก — เพิ่มด้านบน</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium">{row.name}</span>
              <span className="text-muted-foreground">{row.employeeCount} คน</span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
