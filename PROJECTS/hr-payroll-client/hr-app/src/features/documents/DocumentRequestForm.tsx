"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DOC_TYPES, DOC_TYPE_LABELS } from "@/features/documents/types"

const schema = z.object({
  docType: z.enum(DOC_TYPES, "เลือกประเภทเอกสาร"),
  copies: z.number().min(1).max(10),
  purpose: z.string().trim().min(5, "กรุณาระบุวัตถุประสงค์อย่างน้อย 5 ตัวอักษร"),
})

type FormValues = z.infer<typeof schema>

const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function DocumentRequestForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { docType: "employment_cert", copies: 1, purpose: "" },
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/documents/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "ส่งคำขอไม่สำเร็จ")
      }
      setSuccess(true)
      form.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งคำขอไม่สำเร็จ")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <p className="text-sm text-green-700">
        ส่งคำขอเอกสารแล้ว — HR จะแจ้งผลทาง LINE
      </p>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="docType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ประเภทเอกสาร</FormLabel>
              <FormControl>
                <select className={inputClassName} {...field}>
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {DOC_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="copies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>จำนวนชุด</FormLabel>
              <FormControl>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className={inputClassName}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(Number.parseInt(e.target.value, 10) || 1)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>วัตถุประสงค์</FormLabel>
              <FormControl>
                <textarea
                  className="min-h-[80px] w-full rounded-lg border border-input px-3 py-2 text-sm"
                  placeholder="เช่น ยื่นกู้บ้าน, ขอวีซ่า"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "กำลังส่ง…" : "ส่งคำขอเอกสาร"}
        </Button>
      </form>
    </Form>
  )
}
